<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * ExportLinehaul class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class ExportLinehaul
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
	 * Get function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(object $params): array
	{

		$date_from = date("Y-m-d", strtotime($params->query->date_from));
		$date_to = date("Y-m-d", strtotime($params->query->date_to));

		$sql = "SELECT 
					t.*, c.name as customername
				FROM {$_SESSION["SCHEMA"]}.linehaul_exp t
				LEFT JOIN {$_SESSION["SCHEMA"]}.customers c on t.customerno::text = c.customerno::text
				WHERE t.date BETWEEN :DATE_FROM AND :DATE_TO
				ORDER by t.id
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATE_FROM', $date_from, PDO::PARAM_STR);
		$stmt->bindParam(':DATE_TO', $date_to, PDO::PARAM_STR);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * Insert function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Insert(object $params): bool
	{

		$date = date("Y-m-d", strtotime($params->date));

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.linehaul_exp 
				(date, amount, currency, percent, customerno, country, sdepo, rdepo, month, type_id, ident, import_parcels) 
				VALUES 
				(:DATE, :AMOUNT, :CURRENCY, :PERCENT, :CUSTOMERNO, :COUNTRY, :SDEPO, :RDEPO, :MONTH, :TYPE_ID, :IDENT, :IMPORT_PARCELS)
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATE', $date, PDO::PARAM_STR);
		$stmt->bindParam(':AMOUNT', $params->amount, PDO::PARAM_STR);
		$stmt->bindParam(':CURRENCY', $params->currency, PDO::PARAM_STR);
		$stmt->bindParam(':PERCENT', $params->percent, PDO::PARAM_INT);
		$stmt->bindParam(':CUSTOMERNO', $params->customerno, PDO::PARAM_STR);
		$stmt->bindParam(':COUNTRY', $params->country, PDO::PARAM_STR);
		$stmt->bindParam(':SDEPO', $params->sdepo, PDO::PARAM_STR);
		$stmt->bindParam(':RDEPO', $params->rdepo, PDO::PARAM_STR);
		$stmt->bindParam(':MONTH', $params->month, PDO::PARAM_INT);
		$stmt->bindParam(':TYPE_ID', $params->type_id, PDO::PARAM_INT);
		$stmt->bindParam(':IDENT', $params->ident, PDO::PARAM_STR);
		$stmt->bindParam(':IMPORT_PARCELS', $params->import_parcels, PDO::PARAM_BOOL);
		$stmt->execute();

		return true;
	}

	/**
	 * Update function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(object $params): bool
	{

		$date = date("Y-m-d", strtotime($params->date));

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.linehaul_exp 
				SET 
					date = :DATE, 
					amount = :AMOUNT, 
					currency = :CURRENCY, 
					percent = :PERCENT, 
					customerno = :CUSTOMERNO, 
					country = :COUNTRY, 
					sdepo = :SDEPO, 
					rdepo = :RDEPO, 
					month = :MONTH, 
					type_id = :TYPE_ID, 
					ident = :IDENT, 
					import_parcels = :IMPORT_PARCELS
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATE', $date, PDO::PARAM_STR);
		$stmt->bindParam(':AMOUNT', $params->amount, PDO::PARAM_STR);
		$stmt->bindParam(':CURRENCY', $params->currency, PDO::PARAM_STR);
		$stmt->bindParam(':PERCENT', $params->percent, PDO::PARAM_INT);
		$stmt->bindParam(':CUSTOMERNO', $params->customerno, PDO::PARAM_STR);
		$stmt->bindParam(':COUNTRY', $params->country, PDO::PARAM_STR);
		$stmt->bindParam(':SDEPO', $params->sdepo, PDO::PARAM_STR);
		$stmt->bindParam(':RDEPO', $params->rdepo, PDO::PARAM_STR);
		$stmt->bindParam(':MONTH', $params->month, PDO::PARAM_INT);
		$stmt->bindParam(':TYPE_ID', $params->type_id, PDO::PARAM_INT);
		$stmt->bindParam(':IDENT', $params->ident, PDO::PARAM_STR);
		$stmt->bindParam(':IMPORT_PARCELS', $params->import_parcels, PDO::PARAM_BOOL);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}

	/**
	 * Delete function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Delete(object $params): bool
	{

		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.linehaul_exp 
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}
}
