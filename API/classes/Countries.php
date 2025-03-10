<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Countries class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Countries
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

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.georouting order by countryname";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * GetSender function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetSender(object $params): array
	{

		$date_from = date("Y-m-d", strtotime($params->date_from));
		$date_to = date("Y-m-d", strtotime($params->date_to));

		$sql = "SELECT sc.country_name, sc.country_iso_numcode, sc.dsw_country_code::varchar 
				FROM cpm.mcountry_sc sc 
				WHERE sc.date BETWEEN '{$date_from}' AND '{$date_to}'
				GROUP BY sc.country_name, sc.country_iso_numcode, sc.dsw_country_code
				ORDER BY sc.country_name ASC
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * GetReceiver function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetReceiver(object $params): array
	{

		$date_from = date("Y-m-d", strtotime($params->date_from));
		$date_to = date("Y-m-d", strtotime($params->date_to));

		$sql = "SELECT rc.country_name, rc.country_iso_numcode, rc.dsw_country_code::varchar 
				FROM cpm.mcountry_rc rc 
				WHERE rc.date BETWEEN '{$date_from}' AND '{$date_to}'
				GROUP BY rc.country_name, rc.country_iso_numcode, rc.dsw_country_code
				ORDER BY rc.country_name ASC
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}
}
