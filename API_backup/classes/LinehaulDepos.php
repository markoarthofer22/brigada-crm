<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * LinehaulDepos class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class LinehaulDepos
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

		$sql = "SELECT distinct depo FROM {$_SESSION["SCHEMA"]}.linehaul_depos ORDER BY depo;";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}
}
