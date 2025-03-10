<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Products class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Sources
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

		$sql = "SELECT name as source, id FROM {$_SESSION["SCHEMA"]}.sources ORDER BY id";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}
}
