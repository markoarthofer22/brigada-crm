<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * LinehaulRoutes class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class LinehaulRoutes
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
	 * GetAll function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll(): array
	{

		$sql = "SELECT name, id FROM {$_SESSION["SCHEMA"]}.linehaul_routes ORDER BY id ASC";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * GetAllExport function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAllExport(): array
	{

		$sql = "SELECT ident AS name, max(id) AS id FROM {$_SESSION["SCHEMA"]}.linehaul_exp GROUP BY ident ORDER BY id ASC";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}
}
