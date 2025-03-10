<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Custom class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Custom
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

		$where = "";
		if ($params->query->type) {
			$where .= " AND m.type_id = {$params->query->type} ";
		}

		$sql = "SELECT
					m.id,
					m.date,
					m.revcost,
					m.product_id,
					m.type_id,
					m.amount,
					m.currency,
					m.customerno::TEXT,
					c.name as customername,
					m.depo,
					m.tour,
					m.country,
					m.tcountry,
					m.product,
					m.month,
					m.calc
				FROM {$_SESSION["SCHEMA"]}.custom m
				LEFT JOIN {$_SESSION["SCHEMA"]}.customers c ON c.customerno::text = m.customerno::text
				WHERE m.date BETWEEN :DATE_FROM AND :DATE_TO {$where}
				ORDER BY m.date, m.product_id, m.type_id, m.id
				-- ORDER BY m.product_id, m.id DESC
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATE_FROM', $params->date_from, PDO::PARAM_STR);
		$stmt->bindParam(':DATE_TO', $params->date_to, PDO::PARAM_STR);
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

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.custom 
				(date, revcost, product_id, type_id, amount, currency, customerno, depo, tour, country, tcountry, month, product,calc) 
				VALUES 
				(:DATE, :REVCOST, :PRODUCT_ID, :TYPE_ID, :AMOUNT, :CURRENCY, :CUSTOMERNO, :DEPO, :TOUR, :COUNTRY, :TCOUNTRY, :MONTH, :PRODUCT,:CALC)
		";

		$stmt = $this->database->prepare($sql);

		$stmt->bindParam(':DATE', $params->date, PDO::PARAM_STR);
		$stmt->bindParam(':REVCOST', $params->revcost, PDO::PARAM_STR);
		$stmt->bindParam(':PRODUCT_ID', $params->product_id, PDO::PARAM_INT);
		$stmt->bindParam(':TYPE_ID', $params->type_id, PDO::PARAM_INT);
		$stmt->bindParam(':AMOUNT', $params->amount, PDO::PARAM_STR);
		$stmt->bindParam(':CURRENCY', $params->currency, PDO::PARAM_STR);
		$stmt->bindParam(':CUSTOMERNO', $params->customerno, $params->customerno == null || $params->customerno == "" ? PDO::PARAM_NULL : PDO::PARAM_INT);
		$stmt->bindParam(':DEPO', $params->depo, PDO::PARAM_STR);
		$stmt->bindParam(':TOUR', $params->tour, PDO::PARAM_STR);
		$stmt->bindParam(':COUNTRY', $params->country, PDO::PARAM_STR);
		$stmt->bindParam(':TCOUNTRY', $params->tcountry, PDO::PARAM_STR);
		$stmt->bindParam(':MONTH', $params->month, PDO::PARAM_STR);
		$stmt->bindParam(':PRODUCT', $params->product, PDO::PARAM_STR);
		$stmt->bindParam(':CALC', $params->calc, PDO::PARAM_BOOL);
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

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.custom 
				SET 
					date = :DATE,
					revcost = :REVCOST,
					product_id = :PRODUCT_ID,
					type_id = :TYPE_ID,
					amount = :AMOUNT,
					currency = :CURRENCY,
					customerno = :CUSTOMERNO,
					depo = :DEPO,
					tour = :TOUR,
					country = :COUNTRY,
					tcountry = :TCOUNTRY,
					month = :MONTH,
					product = :PRODUCT,
					calc = :CALC
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATE', $params->date, PDO::PARAM_STR);
		$stmt->bindParam(':REVCOST', $params->revcost, PDO::PARAM_STR);
		$stmt->bindParam(':PRODUCT_ID', $params->product_id, PDO::PARAM_INT);
		$stmt->bindParam(':TYPE_ID', $params->type_id, PDO::PARAM_INT);
		$stmt->bindParam(':AMOUNT', $params->amount, PDO::PARAM_STR);
		$stmt->bindParam(':CURRENCY', $params->currency, PDO::PARAM_STR);
		$stmt->bindParam(':CUSTOMERNO', $params->customerno, $params->customerno == null || $params->customerno == "" ? PDO::PARAM_NULL : PDO::PARAM_INT);
		$stmt->bindParam(':DEPO', $params->depo, PDO::PARAM_STR);
		$stmt->bindParam(':TOUR', $params->tour, PDO::PARAM_STR);
		$stmt->bindParam(':COUNTRY', $params->country, PDO::PARAM_STR);
		$stmt->bindParam(':TCOUNTRY', $params->tcountry, PDO::PARAM_STR);
		$stmt->bindParam(':MONTH', $params->month, PDO::PARAM_STR);
		$stmt->bindParam(':PRODUCT', $params->product, PDO::PARAM_STR);
		$stmt->bindParam(':CALC', $params->calc, PDO::PARAM_BOOL);
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

		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.custom 
				WHERE id = :ID
		";


		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}
}
