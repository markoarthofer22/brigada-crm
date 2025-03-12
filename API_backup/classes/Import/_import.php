<?php

namespace PP\Classes\Import;

use PDO;
use stdClass;

/**
 * Import class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class _import
{

	protected $database;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		// $this->db = Database::Connection();
		$this->database = $db;
	}

	/**
	 * GetModules function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetModules(): array
	{

		$sql = "SELECT id, LOWER(SPLIT_PART(name, ' ', 1)) AS name FROM {$_SESSION["SCHEMA"]}.status_modules";
		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * GetNextModule function
	 *
	 * @return object
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetNextModule(): object
	{

		$sql = "SELECT
					d.id,
					d.state,
					s.month,
					s.state as month_status,
					d.smodule_id
				FROM {$_SESSION["SCHEMA"]}.status_detailed d
				JOIN {$_SESSION["SCHEMA"]}.status s ON s.id = d.status_id
				WHERE d.done is not true 
				ORDER BY d.id ASC
				LIMIT 1
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		// $results = $stmt->fetchAll(PDO::FETCH_OBJ);
		$result = $stmt->fetchObject();

		return $result ? $result : new stdClass;
	}
}
