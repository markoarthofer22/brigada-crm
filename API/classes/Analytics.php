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
					{$_where} AND t.ended_at IS NOT NULL
					ORDER BY t.started_at ASC
				)
				SELECT * FROM all_data
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();

		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		foreach ($results as &$result) {
			$result["data"] = json_decode($result["data"]);
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

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.tracking_zones tz {$_where} ORDER BY tz.started_at ASC";
		$stmt = $this->database->prepare($sql);

		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

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

		// print_r($results);
		// exit;
		foreach ($results as &$result) {
			if ($result) {
				$result["data"] = json_decode($result["data"], true);
				$result["question"] = json_decode($result["question"], true);
				$result["answer"] = json_decode($result["answer"], true);
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

	public function CountAgeGroup(array $answers): int
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
}
