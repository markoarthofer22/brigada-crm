<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Tracking class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Analytics
{

	protected $database;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		$this->database = $db;
	}

	public function GetTimespan(object $params): array
	{

		$sql = "SELECT min(started_at), max(ended_at) FROM {$_SESSION["SCHEMA"]}.tracking where id_projects = {$params->id_projects}";
		$stmt = $this->database->prepare($sql);

		$stmt->execute();
		$result = $stmt->fetchObject();

		return (array)$result ?: [];
	}

	public function GetTimespanData(object $p, $callback): array
	{

		$start = clone $p->min;
		$startMinute = (int) $start->format('i');
		$start->modify('-' . ($startMinute % $p->interval) . ' minutes');
		$start->setTime((int)$start->format('H'), (int)$start->format('i'), 0);

		// Snap $end up to next 15-minute mark
		$end = clone $p->max;
		$endMinute = (int) $end->format('i');
		$remainder = $endMinute % 15;
		if ($remainder !== 0 || (int)$end->format('s') !== 0) {
			$end->modify('+' . (15 - $remainder) . ' minutes');
		}
		$end->setTime((int)$end->format('H'), (int)$end->format('i'), 0);

		$interval = new \DateInterval("PT{$p->interval}M");
		$period = new \DatePeriod($start, $interval, $end);

		$output = [];

		foreach ($period as $from) {
			$to = new \DateTime($from->format('Y-m-d H:i:s'));
			$to->add($interval);

			$p->params->from = $from->format('Y-m-d H:i:s');
			$p->params->to = $to->format('Y-m-d H:i:s');

			$output[] = [
				"from" => $p->params->from,
				"to" => $p->params->to,
				"data" => $callback->InternalGet($p->params)
			];
		}

		return $output;
	}

	/**
	 * GetTrackings function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetTrackings(object $params): array
	{

		$_where = " WHERE 1=1 ";
		if ($params->id_projects) {
			$_where .= " AND t.id_projects = {$params->id_projects} ";
		}

		if ($params->from && $params->to) {
			$params->from = date('Y-m-d H:i:s', strtotime($params->from));
			$params->to = date('Y-m-d H:i:s', strtotime($params->to));
			$_where .= " AND t.started_at BETWEEN '{$params->from}' AND '{$params->to}' ";
		}

		if ($params->from && !$params->to) {
			$params->from = date('Y-m-d H:i:s', strtotime($params->from));
			$_where .= " AND t.started_at >= '{$params->from}'";
		}

		$sql = "WITH all_data AS (
					SELECT 
						*,
						ROW_NUMBER() OVER(ORDER BY t.id_tracking ASC) AS id_tracking_count
					FROM brigada.tracking t
					{$_where} AND t.ended_at IS NOT NULL -- AND id_tracking in (120)
					ORDER BY t.started_at ASC
				)
				SELECT * FROM all_data
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();

		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		foreach ($results as &$result) {
			$result["data"] = json_decode($result["data"], true);
		}
		return $results;
	}

	/**
	 * GetZones function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetZones(object $params): array
	{

		$_where = " WHERE 1=1 ";
		if ($params->id_tracking) {
			$_where .= " AND tz.id_tracking = {$params->id_tracking} ";
		}

		if ($params->from && $params->to) {
			$params->from = date('Y-m-d H:i:s', strtotime($params->from));
			$params->to = date('Y-m-d H:i:s', strtotime($params->to));
			$_where .= " AND tz.started_at BETWEEN '{$params->from}' AND '{$params->to}' ";
		}

		if ($params->from && !$params->to) {
			$params->from = date('Y-m-d H:i:s', strtotime($params->from));
			$_where .= " AND tz.started_at >= '{$params->from}'";
		}

		$sql = "SELECT tz.*, z.name FROM {$_SESSION["SCHEMA"]}.tracking_zones tz LEFT JOIN {$_SESSION["SCHEMA"]}.zones z ON tz.id_zones = z.id_zones {$_where} ORDER BY tz.started_at ASC";
		$stmt = $this->database->prepare($sql);

		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		return $results ?: [];
	}


	/**
	 * GetZonesForHeatMap function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetZonesForHeatMap(object $params): array
	{

		$_where = " WHERE 1=1 ";
		if ($params->id_tracking) {
			$_where .= " AND tz.id_tracking = {$params->id_tracking} ";
		}

		if ($params->id_projects) {
			$_where .= " AND tz.id_projects = {$params->id_projects} ";
		}

		if ($params->from && $params->to) {
			$params->from = date('Y-m-d H:i:s', strtotime($params->from));
			$params->to = date('Y-m-d H:i:s', strtotime($params->to));
			$_where .= " AND tz.started_at BETWEEN '{$params->from}' AND '{$params->to}' ";
		}

		if ($params->from && !$params->to) {
			$params->from = date('Y-m-d H:i:s', strtotime($params->from));
			$_where .= " AND tz.started_at >= '{$params->from}'";
		}

		$sql = "SELECT tz.*, z.name, EXTRACT(EPOCH FROM (tz.ended_at - tz.started_at)) AS duration_seconds, z.coordinates FROM {$_SESSION["SCHEMA"]}.tracking_zones tz LEFT JOIN {$_SESSION["SCHEMA"]}.zones z ON tz.id_zones = z.id_zones {$_where} ORDER BY tz.started_at ASC";
		$stmt = $this->database->prepare($sql);

		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as &$result) {
			if ($result && $result["coordinates"]) {
				$result["coordinates"] = json_decode($result["coordinates"], true);
				// $result["heat"] = $this->getPolygonCentroid($result["coordinates"]["points"]);
				$result["heat"] = $this->getRandomPointInPolygon($result["coordinates"]["points"]);
				unset($result["coordinates"]);
				$result["heat"]["value"] = (float) $result["duration_seconds"];
			}
			unset($result["duration_seconds"]);
		}

		return $results ?: [];
	}

	/**
	 * GetAnswers function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAnswers(object $params): array
	{

		$_where = " WHERE 1=1 ";
		if ($params->id_tracking) {
			$_where .= " AND ta.id_tracking = {$params->id_tracking} ";
		}
		if ($params->id_zones) {
			$_where .= " AND ta.id_zones = {$params->id_zones} ";
		}

		if ($params->id_tracking && !$params->id_zones) {
			$_where .= " AND id_zones IS NULL ";
		}

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.tracking_answers ta {$_where} ORDER BY ta.order ASC";
		$stmt = $this->database->prepare($sql);

		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as &$result) {

			if ($result) {
				$result["answer"] = json_decode($result["answer"], true);

				// Parse GET filters (comma-delimited → arrays)
				$f_spol  = !empty($_GET["f_spol"])
					? array_map('trim', explode(',', $_GET["f_spol"]))
					: [];
				$f_dobna = !empty($_GET["f_dobna"])
					? array_map('trim', explode(',', $_GET["f_dobna"]))
					: [];

				$f_profil = !empty($_GET["f_profil"])
					? array_map('trim', explode(',', $_GET["f_profil"]))
					: [];

				// Only filter if the structure exists
				if (isset($result["answer"]["answer"]) && is_array($result["answer"]["answer"])) {
					$result["answer"]["answer"] = array_values(array_filter(
						$result["answer"]["answer"],
						function ($item) use ($result, $f_spol, $f_dobna, $f_profil) {
							// If no filters at all → keep all
							if (empty($f_spol) && empty($f_dobna) && empty($f_profil)) {
								return true;
							}

							// Current question id
							$id_question = $result["id_questions"] ?? null;

							// Default: keep unless explicitly filtered out
							$keep = true;

							// If this is question 1 → filter by Spol and Dobna skupina
							if ($id_question == 1) {
								$matchSpol = empty($f_spol) || in_array($item["Spol"] ?? '', $f_spol);
								$matchDobna = empty($f_dobna) || in_array($item["Dobna skupina"] ?? '', $f_dobna);
								$keep = $matchSpol && $matchDobna;
							}

							// If this is question 2 → filter by Profil kupca
							elseif ($id_question == 2) {
								$matchProfil = empty($f_profil) || in_array($item["Profil kupca"] ?? '', $f_profil);
								$keep = $matchProfil;
							}

							return $keep;
						}
					));
				}


				if (($_GET["f_profil"] || $_GET["f_spol"] || $_GET["f_dobna"]) && $result["id_questions"] == 1) {
					// echo "<pre>";
					// print_r($result);
				}

				if (($_GET["f_profil"] || $_GET["f_spol"] || $_GET["f_dobna"]) && $result["id_questions"] == 2) {
					// echo "<pre>";
					// print_r($result);
					// exit;
				}


				$result["data"] = json_decode($result["data"], true);
				$result["question"] = json_decode($result["question"], true);
			}
		}

		return $results ?: [];
	}

	public function CountPeople(array $answers): int
	{

		$count = 0;
		foreach ($answers as $answer) {
			if ($answer["id_questions"] == 1) {
				$count = sizeof($answer["answer"]["answer"]);
			}
		}

		return $count;
	}

	public function CountMalePeople(array $answers): int
	{

		$count = 0;
		foreach ($answers as $answer) {
			if ($answer["id_questions"] == 1) {
				foreach ($answer["answer"]["answer"] as $entry) {
					if (isset($entry["Spol"]) && $entry["Spol"] === "Muški") {
						$count++;
					}
				}
			}
		}

		return $count;
	}

	public function CountFemalePeople(array $answers): int
	{

		$count = 0;
		foreach ($answers as $answer) {
			if ($answer["id_questions"] == 1) {
				foreach ($answer["answer"]["answer"] as $entry) {
					if (isset($entry["Spol"]) && $entry["Spol"] === "Ženski") {
						$count++;
					}
				}
			}
		}

		return $count;
	}

	public function CountAgeGroup(array $answers): array
	{

		$counts = [];
		foreach ($answers as $answer) {
			if ($answer["id_questions"] == 1) {
				foreach ($answer["answer"]["answer"] as $entry) {
					$dobna = $entry["Dobna skupina"];
					if (!isset($counts[$dobna])) {
						$counts[$dobna] = 0;
					}
					$counts[$dobna]++;
				}
			}
		}

		return $counts;
	}

	public function PrepareDobnaSkupinaData(array $item, array $result_static_questions): array
	{
		$ds = [];
		foreach ($item["data"]["dobna_skupina_raw"] as $key => $value) {
			if (!isset($ds[$key])) {
				$ds[$key] = 0;
			}
			$ds[$key] += $value;
		}

		$dobna_skupina = array("possible_answers" => $result_static_questions[0]["subquestions"][0]["possible_answers"]);

		// Calculate total count for percentage calculation
		$totalCount = 0;
		foreach ($dobna_skupina["possible_answers"] as $answer) {
			$totalCount += isset($ds[$answer]) ? $ds[$answer] : 0;
		}

		foreach ($dobna_skupina["possible_answers"] as $answer) {
			$count = isset($ds[$answer]) ? $ds[$answer] : 0;
			$percentage = $totalCount > 0 ? round(($count / $totalCount) * 100, 2) : 0;

			$dobna_skupina["data"][] = [
				"label" => $answer,
				"count" => $count,
				"percentage" => $percentage
			];
		}

		return $dobna_skupina;
	}

	public function PrepareDobnaSkupinaDataTotal(array $trackings, array $result_static_questions): array
	{
		$ds = [];
		foreach ($trackings as $item) {
			foreach ($item["data"]["dobna_skupina_raw"] as $key => $value) {
				if (!isset($ds[$key])) {
					$ds[$key] = 0;
				}
				$ds[$key] += $value;
			}
		}

		$dobna_skupina = array("possible_answers" => $result_static_questions[0]["subquestions"][0]["possible_answers"]);

		// Calculate total count for percentage calculation
		$totalCount = 0;
		foreach ($dobna_skupina["possible_answers"] as $answer) {
			$totalCount += isset($ds[$answer]) ? $ds[$answer] : 0;
		}

		foreach ($dobna_skupina["possible_answers"] as $answer) {
			$count = isset($ds[$answer]) ? $ds[$answer] : 0;
			$percentage = $totalCount > 0 ? round(($count / $totalCount) * 100, 2) : 0;

			$dobna_skupina["data"][] = [
				"label" => $answer,
				"count" => $count,
				"percentage" => $percentage
			];
		}

		return $dobna_skupina;
	}

	public function PrepareQuestionsAnswersDataSingleTracking(array $item): array
	{
		$labelCounts = [];
		if ($item["data"]["questions_answers_raw"]) {
			$broj_ljudi = $item["data"]["broj_ljudi"] ?? 0;
			$broj_muski = $item["data"]["broj_muski"] ?? 0;
			$broj_zenski = $item["data"]["broj_zenski"] ?? 0;

			foreach ($item["data"]["questions_answers_raw"] as $qa) {
				$label = $qa["label"] ?? null;
				$answer = $qa["answer"] ?? null;
				$possible_answers = $qa["possible_answers"] ?? [];

				if ($label && $answer) {
					if (!isset($labelCounts[$label])) {
						$labelCounts[$label] = [];
						$labelCounts[$label]["possible_answers"] = $possible_answers;
					}

					$labelCounts[$label]["for_question"]["people"]["broj_ljudi"] += $broj_ljudi;
					$labelCounts[$label]["for_question"]["people"]["broj_muski"] += $broj_muski;
					$labelCounts[$label]["for_question"]["people"]["broj_zenski"] += $broj_zenski;

					foreach ($item["data"]["dobna_skupina_raw"] as $ds => $v) {
						$labelCounts[$label]["for_question"]["dobna_skupina"][$ds] += $v;
					}

					$answers = array_map('trim', explode(',', $answer));
					foreach ($answers as $singleAnswer) {
						if (!isset($labelCounts[$label]["answers"][$singleAnswer])) {
							$labelCounts[$label]["answers"][$singleAnswer] = 0;
						}
						$labelCounts[$label]["answers"][$singleAnswer]++;

						$labelCounts[$label]["for_answers"]["people"][$singleAnswer]["broj_ljudi"] += $broj_ljudi;
						$labelCounts[$label]["for_answers"]["people"][$singleAnswer]["broj_muski"] += $broj_muski;
						$labelCounts[$label]["for_answers"]["people"][$singleAnswer]["broj_zenski"] += $broj_zenski;

						foreach ($item["data"]["dobna_skupina_raw"] as $ds => $v) {
							$labelCounts[$label]["for_answers"]["dobna_skupina"][$singleAnswer][$ds] += $v;
						}
					}
				}
			}
		}

		// echo "<pre>";
		// print_r($labelCounts);
		// exit;

		$questions_answers = [];
		$possible_answers = [];
		foreach ($labelCounts as $label => $data) {
			// print_r($data);
			// exit;
			$totalCountAnswers = array_sum($data["answers"]);
			$totalDobnaSkupinaQuestion = array_sum($data["for_question"]["dobna_skupina"]);
			foreach ($data["for_answers"]["dobna_skupina"] as $key => $value) {
				$totalDobnaSkupinaAnswers[$key] = array_sum($value);
			}

			$countWithPercentages = [];

			// foreach ($data as $answer => $count) {
			// 	print_r($answer);
			// }

			// echo $totalCountAnswers;
			// echo "<br>";
			// exit;

			$possible_answers[$label] = $data["possible_answers"];
			unset($data["possible_answers"]);

			foreach ($data["answers"] as $answer => $count) {
				$percentage = $totalCountAnswers > 0 ? round(($count / $totalCountAnswers) * 100, 2) : 0;
				$countWithPercentages[$answer] = [
					'count' => $count,
					'percentage' => $percentage,
				];
			}

			// echo "<pre>";
			// print_r($data);
			// print_r($totalDobnaSkupinaAnswers);
			// exit;

			$temp = array();
			$temp = array(
				array("label" => "broj_ljudi", "count" => $data["for_question"]["people"]["broj_ljudi"], "percentage" => 100),
				array("label" => "broj_muski", "count" => $data["for_question"]["people"]["broj_muski"], "percentage" => $data["for_question"]["people"]["broj_muski"] > 0 ? round(($data["for_question"]["people"]["broj_muski"] / $data["for_question"]["people"]["broj_ljudi"]) * 100, 2) : 0),
				array("label" => "broj_zenski", "count" => $data["for_question"]["people"]["broj_zenski"], "percentage" => $data["for_question"]["people"]["broj_zenski"] > 0 ? round(($data["for_question"]["people"]["broj_zenski"] / $data["for_question"]["people"]["broj_ljudi"]) * 100, 2) : 0)
			);
			$data["for_question"]["people"] = $temp;

			$temp = array();
			foreach ($item["data"]["dobna_skupina"]["possible_answers"] as $ds => $v) {
				$temp[] = array("label" => $v, "count" => $data["for_question"]["dobna_skupina"][$v] ?? 0, "percentage" => $totalDobnaSkupinaQuestion > 0 ? round(($data["for_question"]["dobna_skupina"][$v] / $totalDobnaSkupinaQuestion) * 100, 2) : 0);
			}
			$data["for_question"]["dobna_skupina"] = $temp;

			$temp = array();
			foreach ($data["for_answers"]["people"] as $key => $it) {
				$temp[] = array("label" => $key, "people" =>  array(
					array("label" => "broj_ljudi", "count" => $it["broj_ljudi"], "percentage" => 100),
					array("label" => "broj_muski", "count" => $it["broj_muski"], "percentage" => $it["broj_muski"] > 0 ? round(($it["broj_muski"] / $it["broj_ljudi"]) * 100, 2) : 0),
					array("label" => "broj_zenski", "count" => $it["broj_zenski"], "percentage" => $it["broj_zenski"] > 0 ? round(($it["broj_zenski"] / $it["broj_ljudi"]) * 100, 2) : 0)
				));
			}
			$data["for_answers"]["people"] = $temp;

			$temp = array();
			foreach ($data["for_answers"]["dobna_skupina"] as $key => $it) {
				$t[$key] = array("label" => $key);
				foreach ($item["data"]["dobna_skupina"]["possible_answers"] as $ds => $v) {
					$count = $it[$v] ?? 0;
					$t[$key]["dobna_skupina"][] = array("label" => $v, "count" => $count, "percentage" => $totalDobnaSkupinaAnswers[$key] > 0 ? round(($count / $totalDobnaSkupinaAnswers[$key]) * 100, 2) : 0);
				}
				$temp[] = $t[$key];
			}
			$data["for_answers"]["dobna_skupina"] = $temp;

			$questions_answers[] = [
				"label" => $label,
				"possible_answers" => $possible_answers[$label],
				"count" => $data,
				"count_percentage" => $countWithPercentages
			];

			// echo "<pre>";
			// print_r($questions_answers);
			// exit;
		}

		// echo "<pre>";
		// print_r($questions_answers);
		// exit;

		return $questions_answers;
	}

	// public function PrepareQuestionsAnswersDataDobnaSkupina(array $trackings): array
	// {

	// 	$people["male"] = 0;
	// 	$people["female"] = 0;
	// 	foreach ($trackings as &$item) {
	// 	}
	// 	return $trackings[0];
	// 	return array();
	// }


	public function PrepareQuestionsAnswersData(array $trackings): array
	{
		$labelCounts = [];
		foreach ($trackings as &$item) {
			// if (is_object($item["data"])) {
			// 	echo "<pre>";
			// 	print_R($item);
			// 	exit;
			// }
			if ($item["data"]["questions_answers_raw"]) {
				$broj_ljudi = $item["data"]["broj_ljudi"] ?? 0;
				$broj_muski = $item["data"]["broj_muski"] ?? 0;
				$broj_zenski = $item["data"]["broj_zenski"] ?? 0;

				foreach ($item["data"]["questions_answers_raw"] as $qa) {
					$label = $qa["label"] ?? null;
					$answer = $qa["answer"] ?? null;
					$possible_answers = $qa["possible_answers"] ?? [];

					if ($label && $answer) {
						if (!isset($labelCounts[$label])) {
							$labelCounts[$label] = [];
							$labelCounts[$label]["possible_answers"] = $possible_answers;
						}

						$labelCounts[$label]["for_question"]["people"]["broj_ljudi"] += $broj_ljudi;
						$labelCounts[$label]["for_question"]["people"]["broj_muski"] += $broj_muski;
						$labelCounts[$label]["for_question"]["people"]["broj_zenski"] += $broj_zenski;

						foreach ($item["data"]["dobna_skupina_raw"] as $ds => $v) {
							$labelCounts[$label]["for_question"]["dobna_skupina"][$ds] += $v;
						}

						$answers = array_map('trim', explode(',', $answer));
						foreach ($answers as $singleAnswer) {
							if (!isset($labelCounts[$label]["answers"][$singleAnswer])) {
								$labelCounts[$label]["answers"][$singleAnswer] = 0;
							}
							$labelCounts[$label]["answers"][$singleAnswer]++;


							$labelCounts[$label]["for_answers"]["people"][$singleAnswer]["broj_ljudi"] += $broj_ljudi;
							$labelCounts[$label]["for_answers"]["people"][$singleAnswer]["broj_muski"] += $broj_muski;
							$labelCounts[$label]["for_answers"]["people"][$singleAnswer]["broj_zenski"] += $broj_zenski;

							foreach ($item["data"]["dobna_skupina_raw"] as $ds => $v) {
								$labelCounts[$label]["for_answers"]["dobna_skupina"][$singleAnswer][$ds] += $v;
							}
						}
					}
				}
			}
		}

		// echo "<pre>";
		// print_r($labelCounts);
		// exit;

		$questions_answers = [];
		$possible_answers = [];
		foreach ($labelCounts as $label => $data) {
			$totalCountAnswers = array_sum($data["answers"]);
			$totalDobnaSkupinaQuestion = array_sum($data["for_question"]["dobna_skupina"]);
			foreach ($data["for_answers"]["dobna_skupina"] as $key => $value) {
				$totalDobnaSkupinaAnswers[$key] = array_sum($value);
			}

			$countWithPercentages = [];

			$possible_answers[$label] = $data["possible_answers"];
			unset($data["possible_answers"]);

			foreach ($data["answers"] as $answer => $count) {
				$percentage = $totalCountAnswers > 0 ? round(($count / $totalCountAnswers) * 100, 2) : 0;
				$countWithPercentages[$answer] = [
					'count' => $count,
					'percentage' => $percentage,
				];
			}

			// print_r($data["for_question"]["people"]);
			$temp = array(
				array("label" => "broj_ljudi", "count" => $data["for_question"]["people"]["broj_ljudi"], "percentage" => 100),
				array("label" => "broj_muski", "count" => $data["for_question"]["people"]["broj_muski"], "percentage" => $data["for_question"]["people"]["broj_muski"] > 0 ? round(($data["for_question"]["people"]["broj_muski"] / $data["for_question"]["people"]["broj_ljudi"]) * 100, 2) : 0),
				array("label" => "broj_zenski", "count" => $data["for_question"]["people"]["broj_zenski"], "percentage" => $data["for_question"]["people"]["broj_zenski"] > 0 ? round(($data["for_question"]["people"]["broj_zenski"] / $data["for_question"]["people"]["broj_ljudi"]) * 100, 2) : 0)
			);
			$data["for_question"]["people"] = $temp;

			$temp = array();

			// print_r($data["for_question"]["dobna_skupina"]);
			foreach ($item["data"]["dobna_skupina"]["possible_answers"] as $ds => $v) {
				$temp[] = array("label" => $v, "count" => $data["for_question"]["dobna_skupina"][$v] ?? 0, "percentage" => $totalDobnaSkupinaQuestion > 0 ? round(($data["for_question"]["dobna_skupina"][$v] / $totalDobnaSkupinaQuestion) * 100, 2) : 0);
			}
			// print_r($temp);
			$data["for_question"]["dobna_skupina"] = $temp;

			$temp = array();
			foreach ($data["for_answers"]["people"] as $key => $it) {
				$temp[] = array("label" => $key, "people" =>  array(
					array("label" => "broj_ljudi", "count" => $it["broj_ljudi"], "percentage" => 100),
					array("label" => "broj_muski", "count" => $it["broj_muski"], "percentage" => $it["broj_muski"] > 0 ? round(($it["broj_muski"] / $it["broj_ljudi"]) * 100, 2) : 0),
					array("label" => "broj_zenski", "count" => $it["broj_zenski"], "percentage" => $it["broj_zenski"] > 0 ? round(($it["broj_zenski"] / $it["broj_ljudi"]) * 100, 2) : 0)
				));
			}
			$data["for_answers"]["people"] = $temp;

			$temp = array();
			foreach ($data["for_answers"]["dobna_skupina"] as $key => $it) {
				$t = array();
				$t[$key] = array("label" => $key);
				foreach ($item["data"]["dobna_skupina"]["possible_answers"] as $ds => $v) {
					$count = $it[$v] ?? 0;
					$t[$key]["dobna_skupina"][] = array("label" => $v, "count" => $count, "percentage" => $totalDobnaSkupinaAnswers[$key] > 0 ? round(($count / $totalDobnaSkupinaAnswers[$key]) * 100, 2) : 0);
				}
				$temp[] = $t[$key];
			}
			$data["for_answers"]["dobna_skupina"] = $temp;

			$questions_answers[] = [
				"label" => $label,
				"possible_answers" => $possible_answers[$label],
				"count" => $data,
				"count_percentage" => $countWithPercentages
			];
		}

		// echo "<pre>";
		// // print_r($data);
		// print_r($questions_answers);
		// exit;

		return $questions_answers;
	}


	public function PrepareQuestionsAnswersDataZones(array $zone, array $item): array
	{

		$result = [];

		// Create a lookup array for answers by question ID
		$answersLookup = [];
		if (isset($zone['questions_answers_raw']) && is_array($zone['questions_answers_raw'])) {
			foreach ($zone['questions_answers_raw'] as $answerData) {
				$questionId = $answerData['id_questions'];
				$answer = $answerData['answer']['answer'] ?? '';
				$possible_answers = $answerData['question']['possible_answers'] ?? [];
				$answersLookup[$questionId]["answer"] = $answer;
				$answersLookup[$questionId]["possible_answers"] = $possible_answers;
			}
		}

		// Process all questions
		if (isset($zone['questions']) && is_array($zone['questions'])) {
			foreach ($zone['questions'] as $question) {
				$questionId = $question['id_questions'];
				$label = $question['label'];

				// Get answer if exists, otherwise empty string
				$answer = $answersLookup[$questionId]["answer"] ?? '';
				$possible_answers = (array)array_values(array_filter($zone['questions'], fn($q) => $q['id_questions'] === $questionId))[0]['possible_answers'] ?? [];

				$possible_answers_count = [];
				foreach ($possible_answers as $ps) {
					$possible_answers_count[$ps]["label"] = $ps;
					$possible_answers_count[$ps]["count"] = $answer == $ps ? ($possible_answers_count[$ps]["count"] ? $possible_answers_count[$ps]["count"] + 1 : 1) : 0;
				}

				$totalCount = array_sum(array_column($possible_answers_count, 'count'));

				foreach ($possible_answers_count as $ps => &$data) {
					$data['percentage'] = $totalCount > 0 ? round(($data['count'] / $totalCount) * 100, 2) : 0;
				}

				$result[] = [
					'label' => $label,
					'answer' => $answer,
					'possible_answers' => $possible_answers,
					'possible_answers_count' => array_values($possible_answers_count),
					'broj_ljudi' => $item["data"]["broj_ljudi"],
					'broj_muski' => $item["data"]["broj_muski"],
					'broj_zenski' => $item["data"]["broj_zenski"],
					'dobna_skupina' => $item["data"]["dobna_skupina"],
				];
			}
		}

		return $result;
	}


	public function PrepareDataZones(array $trackings): array
	{
		$zones = [];
		$zoneDurations = []; // Track durations separately for summing

		// echo "<pre>";
		// print_r($trackings);
		// exit;
		foreach ($trackings as $item) {

			foreach ($item["zones"] as $zone) {
				// print_r($zone);
				// exit;
				$zoneId = $zone["id_zones"];
				$start = new \DateTime($zone["started_at"]);
				$end = new \DateTime($zone["ended_at"]);
				$diff = $start->diff($end);
				$durationInSeconds = ($diff->h * 3600) + ($diff->i * 60) + $diff->s;

				// echo $zoneId;
				// echo "<br>";
				// print_r($zones);

				if (isset($zones[$zoneId])) {
					// echo "<hr>";
					// echo $zoneId;
					// echo "<br>";
					// print_r($zone["questions_answers"]);
					// print_r($zones[$zoneId]["questions_answers"]);
					// exit;

					$zones[$zoneId]["data"]["broj_ljudi"] += $item["data"]["broj_ljudi"];
					$zones[$zoneId]["data"]["broj_muski"] += $item["data"]["broj_muski"];
					$zones[$zoneId]["data"]["broj_zenski"] += $item["data"]["broj_zenski"];

					foreach ($zone["data"]["dobna_skupina"]["data"] as $index => $ageGroupData) {
						$zones[$zoneId]["data"]["dobna_skupina"]["data"][$index]["count"] += $ageGroupData["count"];
					}


					foreach ($zones[$zoneId]["questions_answers"] as &$zqa) {
						foreach ($zone["questions_answers"] as $zq) {
							if ($zq["label"] === $zqa["label"]) {
								// print_r($zq["possible_answers_count"]);
								// print_r($zqa["possible_answers_count"]);
								foreach ($zqa["possible_answers_count"] as &$zqa_pa) {
									foreach ($zq["possible_answers_count"] as $zq_pa) {
										if ($zqa_pa["label"] == $zq_pa["label"]) {
											$zqa_pa["count"] += $zq_pa["count"];
										}
									}
								}
							}
						}
						// print_r($zqa);
					}


					// foreach ($zone["questions_answers"] as $questionIndex => $questionData) {
					// 	// Ensure base structure exists
					// 	if (!isset($zones[$zoneId]["questions_answers"][$questionIndex]["possible_answers_count"])) {
					// 		$zones[$zoneId]["questions_answers"][$questionIndex]["possible_answers_count"] = [];
					// 	}

					// 	foreach ($questionData["possible_answers_count"] as $answerData) {
					// 		$label = $answerData["label"];

					// 		// Initialize if not already
					// 		if (!isset($zones[$zoneId]["questions_answers"][$questionIndex]["possible_answers_count"][$label])) {
					// 			$zones[$zoneId]["questions_answers"][$questionIndex]["possible_answers_count"][$label] = [
					// 				"label" => $label,
					// 				"count" => 0,
					// 				"percentage" => 0 // Will calculate later
					// 			];
					// 		}

					// 		// Add count
					// 		$zones[$zoneId]["questions_answers"][$questionIndex]["possible_answers_count"][$label]["count"] += $answerData["count"];
					// 	}

					// 	// Calculate total for percentage
					// 	$totalCount = 0;
					// 	foreach ($zones[$zoneId]["questions_answers"][$questionIndex]["possible_answers_count"] as $data) {
					// 		$totalCount += $data["count"];
					// 	}

					// 	// Now calculate percentage
					// 	foreach ($zones[$zoneId]["questions_answers"][$questionIndex]["possible_answers_count"] as &$data) {
					// 		$data["percentage"] = $totalCount > 0 ? round(($data["count"] / $totalCount) * 100, 2) : 0;
					// 	}
					// 	unset($data);
					// }


					// foreach ($zone["questions_answers"] as $i => &$questions_answers) {
					// 	// unset($questions_answers["answer"]);
					// 	// echo "<hr>";
					// 	// print_r($zone["questions_answers"][$i]);
					// 	$find_array = array_filter(
					// 		$zones[$zoneId]["questions_answers"],
					// 		function ($qa) use ($questions_answers) {
					// 			return isset($qa["label"]) && $qa["label"] === $questions_answers["label"];
					// 		}
					// 	);
					// 	echo "<hr>";
					// 	echo "<hr>";
					// 	echo "<hr>";
					// 	print_r($questions_answers);
					// 	echo "<hr>";
					// 	print_r($find_array);

					// 	exit;

					// 	foreach ($questions_answers["possible_answers_count"] as $pac) {
					// 		// print_r($pac);
					// 		// print_r($zones[$zoneId]["questions_answers"][$i]["possible_answers_count"]);
					// 	}
					// }

					// // print_r($zone);
					// // exit;
					// // unset($questions_answers);

					// // $zones[$zoneId]["questions_answers"] = $zone["questions_answers"];

					// // print_r($zones[$zoneId]);
					// // exit;
				} else {
					$zones[$zoneId] = [
						"id_zones" => $zoneId,
						"name" => $zone["name"],
						"data" => [
							"broj_ljudi" => $item["data"]["broj_ljudi"],
							"broj_muski" => $item["data"]["broj_muski"],
							"broj_zenski" => $item["data"]["broj_zenski"],
							"dobna_skupina" => $zone["data"]["dobna_skupina"], // Copy the entire structure
						],
						"questions_answers" => $zone["questions_answers"], // Copy the entire structure
					];
					$zoneDurations[$zoneId] = $durationInSeconds;
					// print_r($zones);
					// exit;
				}
				// print_r($zones);
			}
		}

		// header('Content-Type: application/json');

		// echo json_encode($zones);
		// print_r($zones);

		// exit;

		// foreach ($trackings as &$item) {
		// 	foreach ($item["zones"] as $zone) {

		// 		// echo "<pre>";
		// 		// print_r($zone);
		// 		// exit;

		// 		$zoneId = $zone["id_zones"];

		// 		$start = new \DateTime($zone["started_at"]);
		// 		$end = new \DateTime($zone["ended_at"]);
		// 		$diff = $start->diff($end);

		// 		// Convert duration to seconds for easier summing
		// 		$durationInSeconds = ($diff->h * 3600) + ($diff->i * 60) + $diff->s;

		// 		if (isset($zones[$zoneId])) {
		// 			// Zone already exists, sum the data
		// 			$zones[$zoneId]["data"]["broj_ljudi"] += $item["data"]["broj_ljudi"];
		// 			$zones[$zoneId]["data"]["broj_muski"] += $item["data"]["broj_muski"];
		// 			$zones[$zoneId]["data"]["broj_zenski"] += $item["data"]["broj_zenski"];
		// 			$zones[$zoneId]["questions_answers"] = array_values($zone["questions_answers"]);

		// 			// For age groups, merge the data array and sum counts
		// 			foreach ($zone["data"]["dobna_skupina"]["data"] as $index => $ageGroupData) {
		// 				$zones[$zoneId]["data"]["dobna_skupina"]["data"][$index]["count"] += $ageGroupData["count"];
		// 			}

		// 			// echo "<pre>";

		// 			// print_r()

		// 			foreach ($zone["questions_answers"] as $i => $questions_answers) {

		// 				// print_R($questions_answers);

		// 				foreach ($questions_answers["possible_answers_count"] as $j => $qa) {

		// 					// print_r($qa);
		// 					// print_r($qa["possible_answers_count"]);
		// 					$zones[$zoneId]["questions_answers"][$i]["possible_answers_count"][$j]["count"] += $qa["count"];
		// 					// print_r($zones[$zoneId]["questions_answers"][$i]["possible_answers_count"][$j]["count"]);

		// 					// echo "<hr>";
		// 				}

		// 				// exit;
		// 				// print_R($zq["possible_answers_count"]);
		// 				// foreach ($zq["possible_answers_count"] as $index => $paData) {
		// 				// 	print_r($zones[$zoneId]["questions_answers"]);
		// 				// 	print_r($paData);
		// 				// 	exit;
		// 				// 	$zones[$zoneId]["questions_answers"]["possible_answers_count"][$index]["count"] += $paData["count"];
		// 				// }
		// 			}

		// 			// Add duration
		// 			$zoneDurations[$zoneId] += $durationInSeconds;
		// 		} else {
		// 			// First occurrence of this zone
		// 			$zones[$zoneId] = [
		// 				"id_zones" => $zoneId,
		// 				"name" => $zone["name"],
		// 				"data" => [
		// 					"broj_ljudi" => $item["data"]["broj_ljudi"],
		// 					"broj_muski" => $item["data"]["broj_muski"],
		// 					"broj_zenski" => $item["data"]["broj_zenski"],
		// 					"dobna_skupina" => $zone["data"]["dobna_skupina"], // Copy the entire structure
		// 				],
		// 				"questions_answers" => $zone["questions_answers"], // Copy the entire structure
		// 			];
		// 			$zoneDurations[$zoneId] = $durationInSeconds;
		// 		}
		// 	}
		// }

		// header('Content-Type: application/json');
		// echo json_encode($zones);
		// exit;
		// echo "<pre>";
		// print_r($zones);
		// exit;

		// Convert durations back to H:i:s format and add to final array
		$result = [];
		foreach ($zones as $zoneId => $zone) {
			$totalSeconds = $zoneDurations[$zoneId];
			$hours = floor($totalSeconds / 3600);
			$minutes = floor(($totalSeconds % 3600) / 60);
			$seconds = $totalSeconds % 60;
			$totalDuration = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

			// Calculate average lasted time per person
			$numberOfPeople = $zone["data"]["broj_ljudi"];

			// Convert lasted from string to array structure
			$zone["lasted"] = [
				"formatted" => $totalDuration,
				"seconds" => $totalSeconds,
				"average" => [
					"by_number_of_people" => $this->getLastingAverageByNumberOfPeople($totalSeconds, $numberOfPeople, true),
					"by_number_of_people_seconds" => $this->getLastingAverageByNumberOfPeople($totalSeconds, $numberOfPeople, false)
				]
			];

			$result[] = $zone;
		}


		// echo "<pre>";
		$total = [];
		foreach ($result as $r) {


			if (!isset($questions_answers)) {
				$questions_answers = $r["questions_answers"];
			} else {
				foreach ($r["questions_answers"] as $rqa) {
					// print_r($rqa);
					foreach ($questions_answers as &$qa) {
						// print_r($rqa["label"]);
						// print_r($qa["label"]);
						// exit;
						if ($qa["label"] === $rqa["label"]) {
							// echo $rqa["label"];
							// print_r($rqa["possible_answers_count"]);
							// print_r($qa["possible_answers_count"]);
							// exit;
							foreach ($rqa["possible_answers_count"] as $rqa_pa) {
								foreach ($qa["possible_answers_count"] as &$qa_pa) {
									if ($qa_pa["label"] == $rqa_pa["label"]) {
										$qa_pa["count"] += $rqa_pa["count"];
									}
								}
							}

							// print_r($rqa);
							// exit;
							// print_r($questions_answers);
						}
					}
					// print_r($questions_answers);
				}
			}



			// print_r($questions_answers);
			// exit;

			if (!isset($dobna_skupina)) {
				$dobna_skupina = $r["data"]["dobna_skupina"];
			} else {
				foreach ($r["data"]["dobna_skupina"]["data"] as $i => $ds) {
					$dobna_skupina["data"][$i]["count"] += $ds["count"];
				}
			}
			$total["data"] = array(
				"broj_ljudi" => $total["data"]["broj_ljudi"] + $r["data"]["broj_ljudi"],
				"broj_muski" => $total["data"]["broj_muski"] + $r["data"]["broj_muski"],
				"broj_zenski" => $total["data"]["broj_zenski"] + $r["data"]["broj_zenski"],
				"percentage_muski" =>  $total["data"]["broj_ljudi"] > 0 ? round($total["data"]["broj_muski"] / $total["data"]["broj_ljudi"] * 100, 2) : 0,
				"percentage_zenski" =>  $total["data"]["broj_ljudi"] > 0 ? round($total["data"]["broj_zenski"] / $total["data"]["broj_ljudi"] * 100, 2) : 0,
			);
		}


		// echo "<pre>";
		foreach ($questions_answers as &$q) {
			$pac_total_count = is_array($q['possible_answers_count'] ?? null) ? array_sum(array_column($q['possible_answers_count'], 'count')) : 0;
			foreach ($q["possible_answers_count"] as &$pac) {
				$pac["percentage"] = $pac_total_count > 0 ? round($pac["count"] / $pac_total_count * 100, 2) : 0;
			}
		}

		$ds_total_count = is_array($dobna_skupina['data'] ?? null) ? array_sum(array_column($dobna_skupina['data'], 'count')) : 0;
		foreach ($dobna_skupina['data'] as &$item) {
			$item['percentage'] = $ds_total_count > 0 ? round(($item['count'] / $ds_total_count) * 100) : 0;
		}

		// print_r($questions_answers);
		// exit;

		$total["data"]["questions_answers"] = $questions_answers;
		$total["data"]["dobna_skupina"] = $dobna_skupina;
		// print_r($questions_answers);
		// exit;
		// echo json_encode($result[0]["questions_answers"]);
		// echo "<br>";
		// echo "<br>";
		// echo "<br>";
		// echo json_encode($total["data"]["questions_answers"]);
		// exit;

		// print_R($dobna_skupina);
		// exit;

		$output = array("per_zone" => $result, "total" => $total);

		return $output;
	}


	function groupZonesByIdZones(array $zones): array
	{

		// echo "<pre>";
		$grouped = [];

		// Group by id_zones
		foreach ($zones as $zone) {
			$id_zones = $zone['id_zones'];
			if (!isset($grouped[$id_zones])) {
				$grouped[$id_zones] = [];
			}
			$grouped[$id_zones][] = $zone;
		}

		$result = [];

		foreach ($grouped as $group) {
			// Take first zone as base structure (keep everything as is)
			$base = $group[0];

			// Only sum lasted field
			$totalSeconds = 0;
			foreach ($group as $zone) {
				$timeParts = explode(':', $zone['lasted']['formatted']);
				$totalSeconds += (int)$timeParts[0] * 3600 + (int)$timeParts[1] * 60 + (int)$timeParts[2];

				$numberOfPeople = $zone["data"]["broj_ljudi"];
				$males = $zone["data"]["broj_muski"];
				$females = $zone["data"]["broj_zenski"];
			}
			$hours = str_pad(floor($totalSeconds / 3600), 2, '0', STR_PAD_LEFT);
			$minutes = str_pad(floor(($totalSeconds % 3600) / 60), 2, '0', STR_PAD_LEFT);
			$seconds = str_pad($totalSeconds % 60, 2, '0', STR_PAD_LEFT);
			$base['lasted']['formatted'] = "$hours:$minutes:$seconds";
			$base['lasted']['seconds'] = $totalSeconds;
			$base['lasted']['average'] = [
				'by_number_of_people' => $this->getLastingAverageByNumberOfPeople($totalSeconds, $numberOfPeople, true),
				'by_number_of_people_seconds' => $this->getLastingAverageByNumberOfPeople($totalSeconds, $numberOfPeople, false)
			];

			$base['data']['broj_ljudi'] = $numberOfPeople;
			$base['data']['broj_muski'] = $males;
			$base['data']['broj_zenski'] = $females;

			$result[] = $base;
		}

		return $result;
	}

	public function getLastingAverageByNumberOfPeople($totalSeconds, $numberOfPeople, $formatted = false): string
	{

		$averageByPeople = "00:00:00";
		$avgSecondsPerPerson = 0;

		if ($numberOfPeople > 0) {
			$avgSecondsPerPerson = $totalSeconds / $numberOfPeople;
			$avgHours = floor($avgSecondsPerPerson / 3600);
			$avgMinutes = floor(($avgSecondsPerPerson % 3600) / 60);
			$avgSecsRemainder = $avgSecondsPerPerson % 60;
			$averageByPeople = sprintf('%02d:%02d:%06.3f', $avgHours, $avgMinutes, $avgSecsRemainder);
		}

		if ($formatted) {
			return $averageByPeople;
		}


		return $avgSecondsPerPerson;
	}


	public function getPolygonCentroid($points)
	{
		$signedArea = 0;
		$cx = 0;
		$cy = 0;
		$count = count($points);

		for ($i = 0; $i < $count; $i++) {
			$x0 = $points[$i]['x'];
			$y0 = $points[$i]['y'];
			$x1 = $points[($i + 1) % $count]['x'];
			$y1 = $points[($i + 1) % $count]['y'];

			$a = $x0 * $y1 - $x1 * $y0;
			$signedArea += $a;
			$cx += ($x0 + $x1) * $a;
			$cy += ($y0 + $y1) * $a;
		}

		$signedArea *= 0.5;
		$cx = ($cx) / (6.0 * $signedArea);
		$cy = ($cy) / (6.0 * $signedArea);

		return ['x' => $cx, 'y' => $cy];
	}


	public function getRandomPointInPolygon($points)
	{
		$xs = array_column($points, 'x');
		$ys = array_column($points, 'y');

		$minX = min($xs);
		$maxX = max($xs);
		$minY = min($ys);
		$maxY = max($ys);

		while (true) {
			$x = rand($minX, $maxX);
			$y = rand($minY, $maxY);

			if ($this->pointInPolygon($x, $y, $points)) {
				return ['x' => $x, 'y' => $y];
			}
		}
	}

	private function pointInPolygon($x, $y, $polygon)
	{
		$inside = false;
		$n = count($polygon);

		for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
			$xi = $polygon[$i]['x'];
			$yi = $polygon[$i]['y'];
			$xj = $polygon[$j]['x'];
			$yj = $polygon[$j]['y'];

			$intersect = (($yi > $y) != ($yj > $y))
				&& ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi + 0.00001) + $xi);

			if ($intersect) {
				$inside = !$inside;
			}
		}

		return $inside;
	}
}
