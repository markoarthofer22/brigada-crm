<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Customers class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Customers
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

		$limit = $params->limit;
		$page = ($params->page - 1) * $limit;

		$where = " WHERE 1=1 ";
		if ($params->query->name) {
			$name = strtolower(trim($params->query->name));
			$where .= " AND LOWER(c.name) like '%{$name}%' ";
		}
		if ($params->query->customerno) {
			$customerno = trim($params->query->customerno);
			$where .= " AND c.customerno = '{$customerno}' OR c.tax_number = '{$customerno}' OR LOWER(c.name) like LOWER('%{$customerno}%') ";
		}
		if ($params->query->tax_number) {
			$tax_number = trim($params->query->tax_number);
			$where .= " AND c.tax_number = '{$tax_number}' ";
		}
		if ($params->query->customer) {
			$customer = trim($params->query->customer);
			$where .= " AND c.customerno = '{$customer}' OR c.tax_number = '{$customer}' OR LOWER(c.name) like LOWER('%{$customer}%') ";
		}

		$sql = "SELECT count(*) as count FROM {$_SESSION["SCHEMA"]}.customers c {$where}";
		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$count = $stmt->fetchObject();

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.customers c {$where} ORDER BY c.name, c.tax_number, c.customerno LIMIT {$limit} OFFSET {$page}";
		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		foreach ($results as $result) {
			$result->values = json_decode($result->values);
		}

		$output = array();

		$output["count"] = $count->count;
		$output["limit"] = $limit;
		$output["page"] = $params->page;
		$output["pages"] = ceil($count->count / $limit);
		$output["results"] = $results;

		return $output;
	}

	/**
	 * Get function
	 *
	 * @return object
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(string $input): object
	{

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.customers c WHERE c.customerno = '{$input}' OR c.tax_number = '{$input}' OR c.name = '{$input}'";
		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$result = $stmt->fetchObject();
		if ($result) {
			$result->values = json_decode($result->values);
		}
		return $result;
	}
}
