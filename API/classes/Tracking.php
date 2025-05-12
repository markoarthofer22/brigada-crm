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
class Tracking
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
	 * GetAll function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll(object $params): array
	{

		$_where = " WHERE 1=1 ";
		if ($params->id_projects) {
			$_where .= " AND t.id_projects = {$params->id_projects} ";
		}

		// $sql = "SELECT 
		// 			* 
		// 		FROM {$_SESSION["SCHEMA"]}.tracking t
		// 		{$_where}
		// 		AND t.ended_at IS NULL
		// 		AND t.id_users = {$_SESSION["user"]["id_users"]}
		// 		ORDER BY t.started_at ASC
		// ";
		$sql = "WITH all_data AS (
					SELECT 
						*,
						ROW_NUMBER() OVER(ORDER BY t.id_tracking ASC) AS id_tracking_count
					FROM brigada.tracking t
					WHERE 
						1=1  
						AND t.id_projects = 8 
						AND t.id_users = 12
					ORDER BY t.started_at ASC
				)
				SELECT * FROM all_data WHERE ended_at IS NULL
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
	 * Get function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(object $params): array
	{
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.tracking t WHERE t.id_tracking = :ID AND t.id_users = {$_SESSION["user"]["id_users"]}";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result) {
			$result["data"] = json_decode($result["data"]);
		}

		return $result ?: [];
	}


	/**
	 * Add function
	 *
	 * @param object $params
	 * @return int
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Add(object $params): int
	{

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.tracking 
					(id_projects, data, id_users) 
				VALUES 
					(:ID_PROJECTS, :DATA, :ID_USERS)
				RETURNING id_tracking
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects, PDO::PARAM_INT);
		$stmt->bindParam(':ID_USERS', $_SESSION["user"]["id_users"], PDO::PARAM_INT);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return (int)$result['id_tracking'];
	}

	/**
	 * Update function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.tracking 
				SET data = :DATA, id_projects = :ID_PROJECTS
				WHERE id_tracking = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects, PDO::PARAM_INT);
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
	}

	/**
	 * End function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function End(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.tracking 
				SET 
					ended_at = NOW()
				WHERE id_tracking = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
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
				$result["data"] = json_decode($result["data"]);
				$result["question"] = json_decode($result["question"]);
				$result["answer"] = json_decode($result["answer"]);
			}
		}

		return $results ?: [];
	}

	/**
	 * GetAnswer function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAnswer(object $params): array
	{
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.tracking_answers ta WHERE ta.id_tracking_answers = :ID";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result) {
			$result["data"] = json_decode($result["data"]);
			$result["question"] = json_decode($result["question"]);
			$result["answer"] = json_decode($result["answer"]);
		}

		return $result ?: [];
	}


	/* AddAnswer function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function AddAnswer(object $params): int
	{
		$fields = [
			"id_tracking" => ":ID_TRACKING",
			"id_projects" => ":ID_PROJECTS",
			"id_questions" => ":ID_QUESTIONS",
			"question" => ":QUESTION",
			"answer" => ":ANSWER",
			"\"order\"" => ":ORDER",
			"data" => ":DATA"
		];

		if (isset($params->id_zones)) {
			$fields["id_zones"] = ":ID_ZONES";
			$fields["id_tracking_zones"] = ":ID_TRACKING_ZONES";
		}

		$columns = implode(", ", array_keys($fields));
		$values  = implode(", ", array_values($fields));

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.tracking_answers ($columns) VALUES ($values)
				ON CONFLICT (id_tracking, id_questions, id_tracking_zones, id_zones) 
				DO NOTHING
				RETURNING id_tracking_answers
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_TRACKING', $params->id_tracking, PDO::PARAM_INT);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects, PDO::PARAM_INT);
		$stmt->bindParam(':ID_QUESTIONS', $params->id_questions, PDO::PARAM_INT);
		$stmt->bindParam(':QUESTION', json_encode($params->question), PDO::PARAM_STR);
		$stmt->bindParam(':ANSWER', json_encode($params->answer), PDO::PARAM_STR);
		$stmt->bindParam(':ORDER', $params->order, PDO::PARAM_INT);
		$stmt->bindParam(':DATA', json_encode($params->data), PDO::PARAM_STR);
		if (isset($params->id_zones)) {
			$stmt->bindParam(':ID_ZONES', $params->id_zones, PDO::PARAM_INT);
			$stmt->bindParam(':ID_TRACKING_ZONES', $params->id_tracking_zones, PDO::PARAM_INT);
		}

		$stmt->execute();



		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		if ($result) {
			return (int)$result['id_tracking_answers'];
		}

		return 0;
	}

	/* UpdateAnswer function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function UpdateAnswer(object $params): int
	{
		$sql = "UPDATE {$_SESSION["SCHEMA"]}.tracking_answers
				SET
					id_tracking = :ID_TRACKING,
					id_projects = :ID_PROJECTS,
					id_questions = :ID_QUESTIONS,
					question = :QUESTION,
					answer = :ANSWER,
					\"order\" = :ORDER,
					data = :DATA
				WHERE id_tracking_answers = :ID_TRACKING_ANSWERS
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->bindParam(':ID_TRACKING', $params->id_tracking, PDO::PARAM_INT);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects, PDO::PARAM_INT);
		$stmt->bindParam(':ID_QUESTIONS', $params->id_questions, PDO::PARAM_INT);
		$stmt->bindParam(':QUESTION', json_encode($params->question), PDO::PARAM_STR);
		$stmt->bindParam(':ANSWER', json_encode($params->answer), PDO::PARAM_STR);
		$stmt->bindParam(':ORDER', $params->order, PDO::PARAM_INT);
		$stmt->bindParam(':ID_TRACKING_ANSWERS', $params->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
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

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.tracking_zones tz {$_where} AND ended_at IS NULL ORDER BY tz.started_at ASC";
		$stmt = $this->database->prepare($sql);

		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		return $results ?: [];
	}

	/**
	 * GetZone function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetZone(object $params): array
	{

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.tracking_zones tz WHERE tz.id_tracking_zones = :ID_TRACKING_ZONES";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_TRACKING_ZONES', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		return $result ?: [];
	}

	/**
	 * CheckZoneStarted function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function CheckZoneStarted(object $params): array
	{

		$sql = "SELECT * 
				FROM {$_SESSION["SCHEMA"]}.tracking_zones tz
				WHERE 
					tz.id_tracking = :ID_TRACKING
					AND tz.id_zones = :ID_ZONES
					AND tz.id_projects = :ID_PROJECTS
					AND tz.ended_at IS NULL
		";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_TRACKING', $params->id_tracking, PDO::PARAM_INT);
		$stmt->bindParam(':ID_ZONES', $params->id_zones, PDO::PARAM_INT);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects, PDO::PARAM_INT);

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		return $result ?: [];
	}

	/**
	 * StartZone function
	 *
	 * @param object $params
	 * @return int
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function StartZone(object $params): int
	{

		$_where = " WHERE 1=1 ";
		if ($params->id_tracking) {
			$_where .= " AND tz.id_tracking = {$params->id_tracking} ";
		}

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.tracking_zones 
					(id_tracking, id_projects, id_zones, data) 
				VALUES 
					(:ID_TRACKING, :ID_PROJECTS, :ID_ZONES, :DATA)
				RETURNING id_tracking_zones
		";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->bindParam(':ID_TRACKING', $params->id_tracking, PDO::PARAM_INT);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects, PDO::PARAM_INT);
		$stmt->bindParam(':ID_ZONES', $params->id_zones, PDO::PARAM_INT);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		if ($result) {
			return (int)$result['id_tracking_zones'];
		}

		return 0;
	}

	/**
	 * EndZone function
	 *
	 * @param object $params
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function EndZone(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.tracking_zones tz SET ended_at = NOW() WHERE tz.id_tracking_zones = :ID_TRACKING_ZONES";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_TRACKING_ZONES', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		return true;
	}

	/**
	 * EndOpenZones function
	 *
	 * @param object $params
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function EndOpenZones(object $params): bool
	{

		$where = " 1=1 ";
		// if ($params->id_zones) {
		// 	$where .= " AND tz.id_zones = {$params->id_zones} ";
		// }
		if ($params->id_projects) {
			$where .= " AND tz.id_projects = {$params->id_projects} ";
		}

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.tracking_zones tz SET ended_at = NOW() 
				WHERE 
					{$where}
					AND tz.id_tracking = {$params->id_tracking}
					AND tz.ended_at IS NULL
		";
		$stmt = $this->database->prepare($sql);

		$stmt->execute();
		return true;
	}
}
