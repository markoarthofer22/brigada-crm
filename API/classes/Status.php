<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Linehaul class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Status
{

	protected $database;
	protected $status;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		// $this->db = Database::Connection();
		$this->database = $db;
		$this->status = array(
			0 => 'Waiting for import or file',
			1 => 'Importing',
			2 => 'Import complete',
			3 => 'Processing',
			4 => 'Processing complete',
			5 => 'Waiting for file',
		);
	}

	/**
	 * GetForMonth function
	 *
	 * @return object
	 * @author Ivan Gudelj
	 */
	public function GetForMonth($month, $mid): object
	{

		$sql = "SELECT
					d.id,
					m.id as mid,
					d.status_id,
					m.name,
					d.dstart,
					d.dend,
					d.done,
					d.status,
					COALESCE(d.total, 0) as total,
					CASE 
						WHEN d.total::TEXT ~ '^-?[0-9]+(\.[0-9]+)?$' THEN TO_CHAR(d.total, 'FM999,999,999,990.00')
						ELSE d.total::TEXT
					END AS total_formatted
				FROM {$_SESSION["SCHEMA"]}.status_detailed d
				LEFT JOIN {$_SESSION["SCHEMA"]}.status_modules m ON m.id = d.smodule_id
				LEFT JOIN {$_SESSION["SCHEMA"]}.status s ON d.status_id = s.id
				WHERE s.month = '{$month}' and d.smodule_id = {$mid} 
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$result = $stmt->fetchObject();

		return $result ?: new stdClass();
	}

	/**
	 * Get function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll(object $params): array
	{
		// echo "<pre>";
		$Helper = new Helper($this->database);

		$date_from = date("Y-m-d", strtotime($params->query->date_from));
		$date_to = date("Y-m-d", strtotime($params->query->date_to));

		$sql = "SELECT
					s.id,
					s.month,
					s.dstart,
					s.dend,
					COALESCE(NULLIF(u.realname, ''), u.username) AS realname,
					s.done as sdone,
					s.ended as sended,
					BOOL_AND(COALESCE(d.done, false)) as all_done,
					json_agg(d.*) as modules,
					s.state
				FROM {$_SESSION["SCHEMA"]}.status s
				LEFT JOIN (
					SELECT
						d.id,
						m.id as mid,
						d.status_id,
						m.name,
						d.dstart,
						d.dend,
						d.done,
						d.status,
						COALESCE(d.total, 0) as total,
						CASE 
							WHEN d.total::TEXT ~ '^-?[0-9]+(\.[0-9]+)?$' THEN TO_CHAR(d.total, 'FM999,999,999,990.00')
							ELSE d.total::TEXT
						END AS total_formatted
					FROM {$_SESSION["SCHEMA"]}.status_detailed d
					JOIN {$_SESSION["SCHEMA"]}.status_modules m ON m.id = d.smodule_id
					ORDER BY d.status_id desc, m.id ASC
				) d ON d.status_id = s.id
				LEFT JOIN public.userlist u ON u.id = s.suser
				WHERE s.month BETWEEN '{$date_from}' AND '{$date_to}' 
				GROUP BY s.id, s.month, s.dstart, u.realname, u.username, s.done
				ORDER BY s.id desc, s.month desc, s.dstart, u.realname, u.username, s.done
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);
		$results = json_decode(json_encode($results), true);

		foreach ($results as &$result) {
			$result["modules"] = $result["modules"] == "[null]" ? null : $result["modules"];
			$result["modules"] = json_decode($result["modules"], true);
			if ($result["modules"]) {
				foreach ($result["modules"] as &$module) {
					if ($module) {
						$module["diff_percent"] = null;
						if ($module["done"]) {
							$last_year_month = date('Y-m-d', strtotime('-1 year', strtotime($result["month"])));
							$last_year_data = $this->GetForMonth($last_year_month, $module["mid"]);
							$module["diff_percent"] = number_format($Helper->calculatePercentageDifference($module["total"], $last_year_data->total), 2, ".", "") * 1;
						}
						// $module["status"] = $module["status"] == null ? 0 : $module["status"];
						$module["done"] = $module["status"] == null ? false : $module["done"];
						$module["status_text"] = $this->status[$module["status"]];
					}
				}
			}
		}

		// usort($results, function ($a, $b) {
		// 	return strcmp($b["month"], $a["month"]);
		// });

		return $results;
	}


	/**
	 * GetYears function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetYears(): array
	{
		$sql = "SELECT 
					EXTRACT(YEAR FROM month) AS year
				FROM 
					{$_SESSION["SCHEMA"]}.status s
					group by year
					order by year desc
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * Start function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Start(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.status 
				SET 
					dstart = NOW(), 
					suser = :USER, 
					done = true, 
					state = 1
				WHERE 
					id = :ID AND done = false
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':USER', $_SESSION["user"]["userId"], PDO::PARAM_INT);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.status_detailed 
				(status_id, smodule_id, done, status)
				SELECT 
					:ID, 
					id,
					CASE WHEN id = 1 THEN false ELSE null END,
					CASE WHEN id = 1 THEN 0 ELSE null END
				FROM {$_SESSION["SCHEMA"]}.status_modules
				ORDER BY id
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();


		return true;
	}

	/**
	 * Resume function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Resume(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.status 
				SET 
					state = 0
				WHERE 
					id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}

	/**
	 * End function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function End(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.status 
				SET 
					SET dend = NOW(), 
					ended = true 
				WHERE 
					id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}

	/**
	 * Skip function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Skip(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.status_detailed 
				SET 
					status = 2,
					dstart = NOW(),
					dend = NOW(), 
					done = true, 
					total = 0
				WHERE 
					id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}


	/**
	 * Restart function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Restart(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.status_detailed d 
				SET 
					dstart = null, 
					dend = null, 
					done = CASE WHEN (SELECT 1 FROM {$_SESSION["SCHEMA"]}.status_detailed WHERE status_id = d.status_id AND id < :ID AND done = false LIMIT 1) IS NULL THEN false ELSE NULL END, 
					total = null, 
					status = CASE WHEN (SELECT 1 FROM {$_SESSION["SCHEMA"]}.status_detailed WHERE status_id = d.status_id AND id < :ID AND done = false LIMIT 1) IS NULL THEN 0 ELSE NULL END, 
					ruser = :USER,
					state = 1
				WHERE
					id = :ID --AND done = true
				RETURNING status_id, id;
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':USER', $_SESSION["user"]["userId"], PDO::PARAM_INT);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();
		$result = $stmt->fetchObject();

		if ($result) {
			$sql = "UPDATE {$_SESSION["SCHEMA"]}.status SET calc_b2bc = 0 WHERE id = :ID";
			$stmt = $this->database->prepare($sql);
			$stmt->bindParam(':ID', $result->status_id, PDO::PARAM_INT);
			$stmt->execute();

			return true;
		} else {
			return false;
		}
	}
}
