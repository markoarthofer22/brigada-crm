<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Activites class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Activites
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

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.smm_activity_mapping ORDER BY id";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}
}
