<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Products class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Salespeople
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
	public function GetAll(object $params): array
	{

		$sql = " SELECT 
					a.person_id,
					INITCAP(a.name) as name
				FROM (
					SELECT DISTINCT ON (person_id)
						person_id,
						name
					FROM {$_SESSION["SCHEMA"]}.sales_person
				) a
				WHERE 
					LOWER(a.name) LIKE LOWER('%{$params->query->name}%')
				ORDER by a.name
				LIMIT 50;
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}
}
