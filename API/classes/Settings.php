<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Settings class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Settings
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
	 * Get function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(object $params): array
	{
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.settings s WHERE s.key = :KEY";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':KEY', $params->key, PDO::PARAM_INT);

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result) {
			$result["value"] = json_decode($result["value"]);
		}

		return $result ?: [];
	}
}
