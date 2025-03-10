<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * DirectInjection class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class DirectInjection
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
					p.id, 
					parcelno, 
					c.customerno,
					c.name as customer_name,
					p.date, 
					p.invoice,
					prod.name,
					co.country_name,
					CASE WHEN p.revcost = 1 THEN ROUND(amount, 2) * -1 ELSE ROUND(amount, 2) END AS amount, 
					currency,
					count,
					p.revcost
				FROM {$_SESSION["SCHEMA"]}.parcels p
				INNER JOIN {$_SESSION["SCHEMA"]}.sources s ON s.id = p.source_id
				INNER JOIN {$_SESSION["SCHEMA"]}.products prod ON prod.id = p.product_id
				INNER JOIN {$_SESSION["SCHEMA"]}.customers c ON c.customerno = p.customerno::varchar
				LEFT JOIN public.country co ON co.country_iso_numcode = p.rcountry
				WHERE
					s.name = 'IT4EM'
					AND prod.short = 'DIR'
					AND p.type_id = 1
					AND p.date BETWEEN :DATE_FROM AND :DATE_TO

				UNION

				SELECT 
					p.id, 
					parcelno, 
					c.customerno,
					c.name as customer_name,
					p.date, 
					p.invoice,
					prod.name,
					co.country_name,
					CASE WHEN p.revcost = 1 THEN ROUND(amount, 2) * -1 ELSE ROUND(amount, 2) END AS amount, 
					currency,
					count,
					p.revcost
				FROM {$_SESSION["SCHEMA"]}.parcels p
				INNER JOIN {$_SESSION["SCHEMA"]}.sources s ON s.id = p.source_id
				INNER JOIN {$_SESSION["SCHEMA"]}.products prod ON prod.id = p.product_id
				INNER JOIN {$_SESSION["SCHEMA"]}.customers c ON c.customerno = p.customerno::varchar
				LEFT JOIN public.country co ON co.country_iso_numcode = p.rcountry
				WHERE
					s.name = 'IT4EM'
					AND p.type_id IN (1, 3)
					AND p.count > 0
					AND p.date BETWEEN :DATE_FROM AND :DATE_TO

				ORDER BY customer_name, invoice;
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATE_FROM', $date_from, PDO::PARAM_STR);
		$stmt->bindParam(':DATE_TO', $date_to, PDO::PARAM_STR);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}


	/**
	 * Update function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.parcels SET count = :COUNT WHERE id = :ID";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':COUNT', $params->count, PDO::PARAM_INT);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();
		return true;
	}
}
