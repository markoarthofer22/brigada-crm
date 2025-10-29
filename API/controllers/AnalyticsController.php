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

use function Dom\import_simplexml;
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

		$result = $this->InternalGet($params);



		if (isset($params->interval) && in_array((int)$params->interval, [15, 30, 60], true)) {
			$result["timespan"] = $Analytics->GetTimespan($params);

			$min = new \DateTime($result["timespan"]["min"]);
			$max = new \DateTime($result["timespan"]["max"]);

			$interval = $min->diff($max);
			$totalSeconds = $max->getTimestamp() - $min->getTimestamp();

			// Format the duration like "2h 15m 30s" or similar
			$parts = [];
			if ($interval->h > 0) {
				$parts[] = $interval->h . 'h';
			}
			if ($interval->i > 0) {
				$parts[] = $interval->i . 'm';
			}
			if ($interval->s > 0) {
				$parts[] = $interval->s . 's';
			}
			$formatted = implode(' ', $parts);

			$result["timespan"]["lasted"] = [
				"formatted" => $formatted,
				"seconds" => $totalSeconds
			];
			$result["timespan"]["interval"] = $params->interval;

			$p = new \stdclass;
			$p->interval = $params->interval;
			$p->min = $min;
			$p->max = $max;
			$p->params = $params;
			$result["timespan"]["data"] = $Analytics->GetTimespanData($p, $this);
		}



		/////////////////////////////////////////
		// EVERY 15 MINUTES /////////////////////
		/////////////////////////////////////////
		/////////////////////////////////////////
		/////////////////////////////////////////


		return $response->withJson($result, 200);
	}


	public function InternalGet($params)
	{
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);
		$Projects = new Projects($this->db);
		$Questions = new Questions($this->db);
		$Zones = new Zones($this->db);
		$Analytics = new Analytics($this->db);

		$args = new \stdClass;
		$args->id = $params->id_projects;
		$args->include_zones = true;
		$result = $Projects->Get($args);
		$result_questions = $Questions->GetForProject($args);
		$result_zones = $Zones->GetForProject($args);
		foreach ($result_zones as &$zone) {
			$zone["questions"] = $Questions->GetForZone((object) array("id" => $zone["id_zones"]));
			// $zone["questions_answers_raw"] = $Analytics->GetAnswers((object) array("id_tracking" => $result["id_tracking"], "id_zones" => $zone["id_zones"]));
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
			),
			array(
				"id_projects" => (int)$args->id,
				"id_questions" => 2,
				"id_questions_types" => 4,
				"label" => "Profil kupca",
				"data" => array("required" => true),
				"possible_answers" => array(
					0 => "Obitelj",
					1 => "Pojedinac",
					2 => "Par",
					3 => "Teens",
					4 => "Grupa prijatelja",
				),
				"subquestions" => array()
			)
		);

		$filters = array(
			array(
				"label" => "f_dobna",
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
				"label" => "f_spol",
				"possible_answers" => array(
					0 => "Muški",
					1 => "Ženski",
				)
			),
			array(
				"label" => "f_profil",
				"possible_answers" => array(
					0 => "Obitelj",
					1 => "Pojedinac",
					2 => "Par",
					3 => "Teens",
					4 => "Grupa prijatelja",
				)
			)
		);

		$result["trackings"] = $Analytics->GetTrackings($params);
		// echo json_encode($result["trackings"]);
		// exit;

		foreach ($result["trackings"] as $key => &$item) {

			// if ($item["id_tracking"] == 130) {
			// 	echo "<pre>";
			// 	// $result["trackings"] = json_decode(json_encode($result["trackings"]), true);
			// 	print_r($item);
			// 	exit;
			// }
			// print_r($item);
			// exit;

			// $item["comments"] = (array)$item["data"];
			$item["comments"] = empty($item["data"]) ? new stdClass : (array)$item["data"];
			// print_r($item["data"]);
			// continue;
			$item["data"] = array();

			// $item["lasted"] = date_diff(new \DateTime($item["started_at"]), new \DateTime($item["ended_at"]))->format('%H:%I:%S');
			$diff = date_diff(new \DateTime($item["started_at"]), new \DateTime($item["ended_at"]));
			$item["lasted"] = [
				"formatted" => $diff->format('%H:%I:%S'),
				"seconds" => $diff->s + ($diff->i * 60) + ($diff->h * 3600) + ($diff->days * 86400)
			];

			// $item["answers"] = $Analytics->GetAnswers((object) array("id_tracking" => $item["id_tracking"]));
			$item_answers = $Analytics->GetAnswers((object) array("id_tracking" => $item["id_tracking"]));

			// echo json_encode($item_answers);
			// exit;

			// Check if $item_answers has at least one non-empty question with id_questions = 1
			$hasQ1 = false;
			$hasQ2 = false;

			if (is_array($item_answers)) {
				foreach ($item_answers as $qa) {
					if (!isset($qa["id_questions"])) {
						continue;
					}

					if (
						$qa["id_questions"] == 1 &&
						!empty($qa["answer"]["answer"]) &&
						is_array($qa["answer"]["answer"])
					) {
						$hasQ1 = true;
					}

					if (
						$qa["id_questions"] == 2 &&
						!empty($qa["answer"]["answer"]) &&
						is_array($qa["answer"]["answer"])
					) {
						$hasQ2 = true;
					}
				}
			}

			// Both must be true
			$hasValidAnswers = $hasQ1 && $hasQ2;

			if (!$hasValidAnswers) {
				unset($result["trackings"][$key]);
				continue;
			}

			// echo json_encode($item_answers);
			// exit;

			$item["data"]["broj_ljudi"] = $Analytics->CountPeople($item_answers);
			$item["data"]["broj_muski"] = $Analytics->CountMalePeople($item_answers);
			$item["data"]["broj_zenski"] = $Analytics->CountFemalePeople($item_answers);

			// Calculate percentages
			$totalPeople = $item["data"]["broj_ljudi"];
			$item["data"]["broj_muski_percentage"] = $totalPeople > 0 ? round(($item["data"]["broj_muski"] / $totalPeople) * 100, 2) : 0;
			$item["data"]["broj_zenski_percentage"] = $totalPeople > 0 ? round(($item["data"]["broj_zenski"] / $totalPeople) * 100, 2) : 0;

			$item["data"]["dobna_skupina_raw"] = $Analytics->CountAgeGroup($item_answers);
			$item["data"]["dobna_skupina"] = $Analytics->PrepareDobnaSkupinaData($item, $result_static_questions);
			$item["data"]["profile_raw"] = $Analytics->CountProfileGroup($item_answers);
			$item["data"]["profile"] = $Analytics->PrepareProfileData($item, $result_static_questions);

			$zones = $Analytics->GetZones((object) array("id_tracking" => $item["id_tracking"], "from" => $params->from, "to" => $params->to));

			foreach ($zones as &$zone) {
				// $zone["lasted"] = date_diff(new \DateTime($zone["started_at"]), new \DateTime($zone["ended_at"]))->format('%H:%I:%S');

				$diff = date_diff(new \DateTime($zone["started_at"]), new \DateTime($zone["ended_at"]));
				$totalSeconds = $diff->s + ($diff->i * 60) + ($diff->h * 3600) + ($diff->days * 86400);

				$numberOfPeople = $item["data"]["broj_ljudi"];

				$zone["lasted"] = [
					"formatted" => $diff->format('%H:%I:%S'),
					"seconds" => $totalSeconds,
					"average" => [
						"by_number_of_people" => $Analytics->getLastingAverageByNumberOfPeople($totalSeconds, $numberOfPeople, true),
						"by_number_of_people_seconds" => $Analytics->getLastingAverageByNumberOfPeople($totalSeconds, $numberOfPeople, false)
					]
				];

				$zone["questions"] = $Questions->GetForZone((object) array("id" => $zone["id_zones"]));
				$zone["questions_answers_raw"] = $Analytics->GetAnswers((object) array("id_tracking" => $zone["id_tracking"], "id_zones" => $zone["id_zones"]));
				// $zone["questions_answers"] = $Analytics->PrepareQuestionsAnswersDataZones($zone, $item);
				// $zone["questions"] = [];
				// $zone["questions_answers_raw"] = [];
				$zone["questions_answers"] = [];

				// echo json_encode($zone["questions_answers"]);
				// exit;

				$zone["data"] = array(
					"broj_ljudi" => $item["data"]["broj_ljudi"],
					"broj_muski" => $item["data"]["broj_muski"],
					"broj_zenski" => $item["data"]["broj_zenski"],
					"dobna_skupina" => $item["data"]["dobna_skupina"],
					"profile" => $item["data"]["profile"],
				);
			}

			// $item["zones"] = $zones;
			$item["zones"] = $Analytics->groupZonesByIdZones($zones);
			// $item["zones2"] = $Analytics->groupZonesByIdZones($zones);

			// echo json_encode($item["zones"]);
			// exit;

			foreach ($result_questions as $q) {
				$r = array_values(array_filter(array_map(function ($a) use ($q) {
					if (isset($a['id_questions']) && $a['id_questions'] == $q['id_questions']) {
						return $a['answer'];
					}
					return false;
				}, $item_answers)));

				// echo json_encode($r);
				// echo "\n---\n";
				// continue;

				foreach ($r as $value) {
					// echo $value["answer"];
					// echo "\n---\n";
					$item["data"]["questions_answers_raw"][] = array(
						"id_questions" => $q["id_questions"],
						"id_zones" => $q["id_zones"] ?? null,
						"label" => $q["label"],
						"answer" => $value["answer"] ?? "",
						"possible_answers" => $value["possible_answers"] ?? [],
					);
				}
			}

			// echo json_encode($item_answers);
			// echo json_encode($result_questions);
			// echo json_encode($item["data"]["questions_answers_raw"]);
			// exit;
			// echo "<pre>";
			// print_r($item["data"]["questions_answers_raw"]);
			// print_r($item["zones"]);
			// exit;

			// foreach ($zones as &$zone) {
			// 	$zoneId = $zone["id_zones"];
			// 	$zone["questions_answers_raw"] = array_values(array_filter(
			// 		$item["data"]["questions_answers_raw"],
			// 		fn($qa) => $qa["id_zones"] == $zoneId
			// 	));
			// }

			// if ($item["id_tracking"] == 130) {
			// 	echo "<pre>";
			// 	// $result["trackings"] = json_decode(json_encode($result["trackings"]), true);
			// 	print_r($item);
			// 	exit;
			// }
			// echo "<pre>";
			// print_r($item["data"]["questions_answers_raw"]);
			// exit;

			$item["data"]["questions_answers"] = $Analytics->PrepareQuestionsAnswersDataSingleTracking($item);

			// echo "<pre>";
			// print_r($item["data"]["questions_answers"]);

			// print_r($zones[0]);
			// exit;

			// foreach ($item["zones"] as &$zone) {
			// 	$zoneId = $zone["id_zones"];
			// 	$zone["questions_answers_raw"] = array_values(array_filter(
			// 		$item["data"]["questions_answers_raw"],
			// 		fn($qa) => $qa["id_zones"] == $zoneId
			// 	));
			// }
			// foreach ($item["zones"] as &$zone) {
			// 	$zoneId = $zone["id_zones"];
			// 	$zone["questions_answers"] = array_values(array_filter(
			// 		$item["data"]["questions_answers"],
			// 		fn($qa) => $qa["id_zones"] == $zoneId
			// 	));
			// }
		}


		// foreach ($zones as &$zone) {
		// 	$zoneId = $zone["id_zones"];
		// 	$zone["questions_answers"] = array_values(array_filter(
		// 		$item["data"]["questions_answers"],
		// 		fn($qa) => $qa["id_zones"] == $zoneId
		// 	));
		// }

		// echo "<pre>";
		// print_r($item["data"]["questions_answers"]);
		// print_r($zones);
		// echo json_encode($zones);
		// echo json_encode($result["trackings"]);
		// exit;

		$result["trackings"] = array_values($result["trackings"]);


		// echo json_encode($result["trackings"]);
		// exit;

		$broj_ljudi = 0;
		$broj_muski = 0;
		$broj_zenski = 0;
		$tracking_lasted = 0;
		foreach ($result["trackings"] as &$item) {
			$broj_ljudi += $item["data"]["broj_ljudi"];
			$broj_muski += $item["data"]["broj_muski"];
			$broj_zenski += $item["data"]["broj_zenski"];
			$tracking_lasted += $item["lasted"]["seconds"];
		}

		$result["total_data"]["broj_ljudi"] = $broj_ljudi;
		$result["total_data"]["broj_muski"] = $broj_muski;
		$result["total_data"]["broj_zenski"] = $broj_zenski;

		// Calculate percentages
		$result["total_data"]["broj_muski_percentage"] = $broj_ljudi > 0 ? round(($broj_muski / $broj_ljudi) * 100, 2) : 0;
		$result["total_data"]["broj_zenski_percentage"] = $broj_ljudi > 0 ? round(($broj_zenski / $broj_ljudi) * 100, 2) : 0;

		// Tracking counts
		$result["total_data"]["trackings"]["count"] = count($result["trackings"]);
		$result["total_data"]["trackings"]["total_lasted"] = $tracking_lasted;
		$result["total_data"]["trackings"]["average_people"]["per_tracking"] = $result["total_data"]["trackings"]["count"] > 0 ? $broj_ljudi / $result["total_data"]["trackings"]["count"] : 0;
		$result["total_data"]["trackings"]["average_people"]["per_tracking_males"] = $result["total_data"]["trackings"]["count"] > 0 ? $broj_muski / $result["total_data"]["trackings"]["count"] : 0;
		$result["total_data"]["trackings"]["average_people"]["per_tracking_females"] = $result["total_data"]["trackings"]["count"] > 0 ? $broj_zenski / $result["total_data"]["trackings"]["count"] : 0;
		$result["total_data"]["trackings"]["average_lasted"]["per_people"] = $broj_ljudi > 0 ? $tracking_lasted / $broj_ljudi : 0;
		// $result["total_data"]["trackings"]["average_lasted"]["per_males"] = $broj_muski > 0 ? $tracking_lasted / $broj_muski : 0;
		// $result["total_data"]["trackings"]["average_lasted"]["per_females"] = $broj_zenski > 0 ? $tracking_lasted / $broj_zenski : 0;
		$result["total_data"]["trackings"]["average_lasted"]["per_males"] = $result["total_data"]["trackings"]["average_lasted"]["per_people"] * $result["total_data"]["broj_muski_percentage"] / 100;
		$result["total_data"]["trackings"]["average_lasted"]["per_females"] = $result["total_data"]["trackings"]["average_lasted"]["per_people"] * $result["total_data"]["broj_zenski_percentage"] / 100;

		$result["total_data"]["questions_answers"] = $Analytics->PrepareQuestionsAnswersData($result["trackings"]);
		// $result["total_data"]["questions_answers2"]["general"] = $Analytics->PrepareQuestionsAnswersData($result["trackings"]);
		// $result["total_data"]["questions_answers2"]["dobna_skupina"] = $Analytics->PrepareQuestionsAnswersDataDobnaSkupina($result["trackings"]);

		$result["total_data"]["dobna_skupina"] = $Analytics->PrepareDobnaSkupinaDataTotal($result["trackings"], $result_static_questions);
		$result["total_data"]["profile"] = $Analytics->PrepareProfileDataTotal($result["trackings"], $result_static_questions);
		// $result["total_data"]["zones"] = $Analytics->PrepareDataZones($result["trackings"]);
		// $result["total_data"]["zones"] = $Analytics->PrepareDataZones($result["trackings"]);

		$result["total_data"]["zones"] = $Analytics->PrepareDataZones2($result["trackings"]);




		// Assign questions_answers to each zone
		foreach ($result["total_data"]["zones"]["per_zone"] as &$zone) {
			$zoneId = $zone["id_zones"];
			$zone["questions_answers"] = array_values(array_filter(
				$result["total_data"]["questions_answers"],
				fn($qa) => $qa["id_zones"] == $zoneId
			));
		}

		// echo json_encode($result["trackings"]);
		// echo json_encode($result["total_data"]["questions_answers"]);
		// exit;

		// grouping answers in zones
		foreach ($result["trackings"] as &$tracking) {
			foreach ($tracking["zones"] as &$zone) {
				$grouped = [];
				foreach ($zone['questions_answers_raw'] as &$item) {
					$id = $item['id_questions'];
					// store the first occurrence as base
					if (!isset($grouped[$id])) {
						$grouped[$id] = $item;
						$grouped[$id]['answers_combined'] = [];
					}
					// collect answers
					$answer = $item['answer']['answer'] ?? null;
					if ($answer !== null && $answer !== '') {
						$grouped[$id]['answers_combined'][] = $answer;
					}
				}
				// convert collected answers to comma-separated string
				foreach ($grouped as &$g) {
					$g['answer']['answer'] = implode(',', $g['answers_combined']);
					unset($g['answers_combined']);
				}
				$zone['questions_answers_raw'] = array_values($grouped);
			}
		}


		// heatmap zones filtering only to those who have trackings 
		// that are in the current result set
		// this is to avoid showing zones for trackings that are not part of the filtered data
		$result["zones_heatmap"] = $Analytics->GetZonesForHeatMap($params);
		$all_tracking_ids = array_column($result["trackings"], 'id_tracking');
		$result["zones_heatmap"] = array_filter($result["zones_heatmap"], function ($zone) use ($all_tracking_ids) {
			return in_array($zone["id_tracking"], $all_tracking_ids);
		});
		$result["zones_heatmap"] = array_values($result["zones_heatmap"]);

		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////

		// Group by tracking
		$_trackings = [];
		foreach ($result["zones_heatmap"] as $row) {
			$_trackings[$row['id_tracking']][] = $row;
		}

		$_paths = [];

		// Build full ordered path for each tracking
		foreach ($_trackings as $trackingId => $zones) {
			usort($zones, function ($a, $b) {
				return strtotime($a['started_at']) - strtotime($b['started_at']);
			});

			// Build detailed path (with name + coordinates)
			$path = [];

			foreach ($zones as $z) {
				$path[] = [
					'name' => $z['name'],
					'coordinates' => $z['heat_centroid'] ?? null,
				];
			}

			// Create a hash to identify identical paths
			$pathNames = array_map(fn($z) => $z['name'], $zones);
			$pathKey = md5(json_encode($pathNames));

			// Calculate number_of_people (average per tracking)
			$totalPeople = array_sum(array_column($zones, 'number_of_people'));
			$avgPeople = $totalPeople / count($zones);

			// echo "<pre>";
			if (!isset($_paths[$pathKey])) {
				// print_r($path);
				$_paths[$pathKey] = [
					'path' => $path,
					'count' => 0,
					'total_people' => 0,
					'avg_people' => 0,
					'_set' => false
				];
			} else {
				$__result = [];
				foreach ($_paths[$pathKey]["path"] as $index => $item1) {
					$item2 = $path[$index];

					$merged = $item1; // start from first
					$merged['coordinates']['number_of_people'] =
						$item1['coordinates']['number_of_people'] + $item2['coordinates']['number_of_people'];

					$__result[] = $merged;
				}
				// print_r($__result);
				// exit;

				$_paths[$pathKey]['_set'] = true;
				$_paths[$pathKey]['path'] = $__result;

				// echo "<hr>";
				// echo json_encode($_paths) . "<hr>";
				// echo "<hr>";
			}

			// echo $pathKey . "<br>";
			// echo json_encode($_paths) . "<hr>";

			$_paths[$pathKey]['count']++;
			$_paths[$pathKey]['total_people'] += $totalPeople;
			$_paths[$pathKey]['avg_people'] += $avgPeople; // sum for later averaging
		}

		// exit;

		// Compute percentages
		$totalPaths = array_sum(array_column($_paths, 'count'));
		$_results = [];

		foreach ($_paths as $data) {
			$pathNames = array_map(fn($z) => $z['name'], $data['path']);
			$pathString = implode(' → ', $pathNames);
			$pathCSV = implode(',', $pathNames);

			$_results[] = [
				'pathstring' => $pathString,
				'pathcsv' => $pathCSV,
				'path' => $data['path'],
				'count' => $data['count'],
				'percentage' => round(($data['count'] / $totalPaths) * 100, 2),
				'total_people' => $data['total_people'],
				'avg_people' => round($data['avg_people'] / $data['count'], 2),
				'total_visits' => $data['total_people'] * $data['count']
			];
		}

		// Sort by count descending
		usort($_results, fn($a, $b) => $b['count'] <=> $a['count']);

		$result["zones_paths"] = $_results;

		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////

		$result["result_static_questions"] = $result_static_questions;
		$result["filters"] = $filters;

		return $result;
	}
}
