<?php

namespace PP\Controller;

use Exception;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Projects;
use PP\Classes\Questions;
use PP\Classes\Tracking;
use PP\Classes\Analytics;
use PP\Classes\Zones;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

use PP\Controller\ProjectsController;

use function PHPSTORM_META\type;

/**
 * TrackingController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class AnalyticsController extends BaseController
{

	protected array $colors;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
	}

	/**
	 * __invoke function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __invoke(Request $request, Response $response, array $args): Response
	{
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);
		$Projects = new Projects($this->db);
		$Questions = new Questions($this->db);
		$Zones = new Zones($this->db);
		$Analytics = new Analytics($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		if (!isset($params->id_projects) || $params->id_projects == "") {
			return Message::WriteMessage(
				400,
				["Message" => $Language->Translate(["phrase" => "Missing id_projects"])],
				$response
			);
		}

		$args->id = $params->id_projects;
		$result = $Projects->Get($args);
		$result_questions = $Questions->GetForProject($args);
		$result_zones = $Zones->GetForProject($args);
		foreach ($result_zones as &$zone) {
			$zone["questions"] = $Questions->GetForZone((object) array("id" => $zone["id_zones"]));
		}
		$result_images = $Projects->GetImages($args);

		// $result["static_questions"] = array(
		$result_static_questions = array(
			array(
				"id_projects" => (int)$args->id,
				"id_questions" => 1,
				"id_questions_types" => 4,
				"label" => "Broj ljudi",
				"data" => array("required" => true),
				"possible_answers" => array(
					0 => 1,
					1 => 2,
					2 => 3,
					3 => 4,
					4 => 5,
					5 => 6,
				),
				"subquestions" => array(
					array(
						"id_questions_types" => 4,
						"label" => "Dobna skupina",
						"data" => array("required" => true),
						"possible_answers" => array(
							0 => "0-18",
							1 => "19-30",
							2 => "31-45",
							3 => "46-60",
							4 => "61-75",
							5 => "76+",
						)
					),
					array(
						"id_questions_types" => 4,
						"label" => "Spol",
						"data" => array("required" => true),
						"possible_answers" => array(
							0 => "Muški",
							1 => "Ženski",
						)
					)
				)
			)
		);

		$result["trackings"] = $Analytics->GetTrackings($params);
		foreach ($result["trackings"] as &$item) {
			$item["zones"] = $Analytics->GetZones((object) array("id_tracking" => $item["id_tracking"]));
			// $item["answers"] = $Analytics->GetAnswers((object) array("id_tracking" => $item["id_tracking"]));
			$item_answers = $Analytics->GetAnswers((object) array("id_tracking" => $item["id_tracking"]));
			$item["data"]["broj_ljudi"] = $Analytics->CountPeople($item_answers);
			$item["data"]["dobna_skupina"] = $Analytics->CountAgeGroup($item_answers);
			$item["data"]["broj_muski"] = $Analytics->CountMalePeople($item_answers);
			$item["data"]["broj_zenski"] = $Analytics->CountFemalePeople($item_answers);

			foreach ($result_questions as $q) {
				$r = array_values(array_filter(array_map(function ($a) use ($q) {
					if (isset($a['id_questions']) && $a['id_questions'] == $q['id_questions']) {
						return $a['answer'];
					}
					return false;
				}, $item_answers)))[0];

				$item["data"]["questions_answers"][] = array(
					"id_questions" => $q["id_questions"],
					"label" => $q["label"],
					"answer" => $r["answer"] ?? "",
					"possible_answers" => $q["possible_answers"] ?? [],
				);
			}
		}

		$result["total_data"]["broj_ljudi"] = 0;
		foreach ($result["trackings"] as $item) {
			$result["total_data"]["broj_ljudi"] += $item["data"]["broj_ljudi"];
		}
		$result["total_data"]["broj_muski"] = 0;
		foreach ($result["trackings"] as $item) {
			$result["total_data"]["broj_muski"] += $item["data"]["broj_muski"];
		}
		$result["total_data"]["broj_zenski"] = 0;
		foreach ($result["trackings"] as $item) {
			$result["total_data"]["broj_zenski"] += $item["data"]["broj_zenski"];
		}

		$labelCounts = [];
		foreach ($result["trackings"] as $item) {
			foreach ($item["data"]["questions_answers"] as $qa) {
				$label = $qa["label"] ?? null;
				$answer = $qa["answer"] ?? null;

				if ($label && $answer) {
					if (!isset($labelCounts[$label])) {
						$labelCounts[$label] = [];
					}
					$answers = array_map('trim', explode(',', $answer));
					foreach ($answers as $singleAnswer) {
						if (!isset($labelCounts[$label][$singleAnswer])) {
							$labelCounts[$label][$singleAnswer] = 0;
						}
						$labelCounts[$label][$singleAnswer]++;
					}
				}
			}
		}

		// Convert to non-associative array
		$questions_answers = [];
		foreach ($labelCounts as $label => $data) {
			$questions_answers[] = [
				"label" => $label,
				"count"  => $data
			];
		}
		$result["total_data"]["questions_answers"] = $questions_answers;

		$ds = [];
		foreach ($result["trackings"] as $item) {
			foreach ($item["data"]["dobna_skupina"] as $key => $value) {
				$ds[$key] += $value;
			}
		}
		$dobna_skupina = array("possible_answers" => $result_static_questions[0]["subquestions"][0]["possible_answers"]);
		foreach ($dobna_skupina["possible_answers"] as $answer) {
			$dobna_skupina["data"][] = [
				"label" => $answer,
				"count"  => isset($ds[$answer]) ? $ds[$answer] : 0,
			];
		}
		$result["total_data"]["dobna_skupina"] = $dobna_skupina;


		return $response->withJson($result, 200);
	}
}
