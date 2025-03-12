<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Products class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Tours
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

		$sql = "SELECT distinct tour FROM public.v_tours WHERE tour IS NOT NULL AND tour != '' ORDER BY tour;";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * GetCashModuleTours function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetCashModuleTours(): array
	{

		$sql = "SELECT DISTINCT ON (tour)
					tour
				FROM public.cm_depo_tour
				WHERE
					valid_from <= CURRENT_DATE
					AND NULLIF(tour, '') IS NOT NULL
				ORDER BY tour, insert_date DESC, id DESC;
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * GetDomesticDepos function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetDomesticDepos(): array
	{

		$sql = "SELECT
					depot_code as depo
				FROM public.sett_domestic_depots
				WHERE 
					monthly_subcontractor_invoice = true
				ORDER BY depo
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}
}
