<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * IT4EM class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class IT4EM
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

		$sql = "SELECT 
					*
				FROM {$_SESSION["SCHEMA"]}.it4em_product_mapping
				ORDER BY id
		";

		$stmt = $this->database->prepare($sql);
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

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.it4em_product_mapping 
				(prod, prod_name, prod_type, product_id, type_id, nonprofit) 
				VALUES 
				(:PROD, :PROD_NAME, :PROD_TYPE, :PRODUCT_ID, :TYPE_ID, :NONPROFIT)
		";

		$stmt = $this->database->prepare($sql);

		$stmt->bindParam(':PROD', $params->prod, PDO::PARAM_STR);
		$stmt->bindParam(':PROD_NAME', $params->prod_name, PDO::PARAM_STR);
		$stmt->bindParam(':PROD_TYPE', $params->prod_type, PDO::PARAM_STR);
		$stmt->bindParam(':PRODUCT_ID', $params->product_id, PDO::PARAM_INT);
		$stmt->bindParam(':TYPE_ID', $params->type_id, PDO::PARAM_INT);
		$stmt->bindParam(':NONPROFIT', $params->nonprofit, PDO::PARAM_BOOL);
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

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.it4em_product_mapping 
				SET prod = :PROD, 
					prod_name = :PROD_NAME, 
					prod_type = :PROD_TYPE, 
					product_id = :PRODUCT_ID, 
					type_id = :TYPE_ID, 
					nonprofit = :NONPROFIT 
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':PROD', $params->prod, PDO::PARAM_STR);
		$stmt->bindParam(':PROD_NAME', $params->prod_name, PDO::PARAM_STR);
		$stmt->bindParam(':PROD_TYPE', $params->prod_type, PDO::PARAM_STR);
		$stmt->bindParam(':PRODUCT_ID', $params->product_id, PDO::PARAM_INT);
		$stmt->bindParam(':TYPE_ID', $params->type_id, PDO::PARAM_INT);
		$stmt->bindParam(':NONPROFIT', $params->nonprofit, PDO::PARAM_BOOL);
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

		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.it4em_product_mapping 
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}
}
