<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Types class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Types
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
	public function GetAll(array $filter = []): array
	{

		$where = " WHERE 1=1 ";
		if ($filter) {
			if ($filter["id"]) {
				$ids = implode(",", $filter["id"]);
				$where .= " AND id IN ({$ids}) ";
			}
			if (!empty($filter["manual"]) && $filter["manual"]) {
				$where .= " AND manual = true ";
			} else {
				$where .= " AND manual = false ";
			}
		}

		// echo "<pre>";
		// print_r($filter);

		$sql = "SELECT id, dinsert, trim(name) as name, manual FROM {$_SESSION["SCHEMA"]}.types {$where} ORDER BY id ASC;";

		// echo $sql;
		// exit;

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * GetAll_IT4EM function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll_IT4EM(array $filter = []): array
	{

		$where = " WHERE 1=1 ";
		if ($filter) {
			if (!empty($filter["nonprofit"]) && $filter["nonprofit"]) {
				$where .= " AND nonprofit = true ";
			} else {
				$where .= " AND nonprofit = false ";
			}
		}

		$sql = "SELECT prod, prod_name FROM {$_SESSION["SCHEMA"]}.it4em_product_mapping {$where} ORDER BY prod ASC;";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}
}
