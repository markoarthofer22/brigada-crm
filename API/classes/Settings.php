<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Settings class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Settings
{

	protected $db;
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
	public function Get(): array
	{

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.settings ORDER BY id ASC;";

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

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.settings 
				(ident, val, display, unit, required, details) 
				VALUES 
				(:IDENT, :VAL, :DISPLAY, :UNIT, :REQUIRED, :DETAILS)
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':IDENT', $params->ident, PDO::PARAM_STR);
		$stmt->bindParam(':VAL', $params->val, PDO::PARAM_STR);
		$stmt->bindParam(':DISPLAY', $params->display, PDO::PARAM_STR);
		$stmt->bindParam(':UNIT', $params->unit, PDO::PARAM_STR);
		$stmt->bindParam(':REQUIRED', $params->required, PDO::PARAM_BOOL);
		$stmt->bindParam(':DETAILS', $params->details, PDO::PARAM_STR);
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

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.settings 
				SET 
					ident = :IDENT, 
					val = :VAL, 
					display = :DISPLAY, 
					unit = :UNIT, 
					required = :REQUIRED, 
					details = :DETAILS 
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':IDENT', $params->ident, PDO::PARAM_STR);
		$stmt->bindParam(':VAL', $params->val, PDO::PARAM_STR);
		$stmt->bindParam(':DISPLAY', $params->display, PDO::PARAM_STR);
		$stmt->bindParam(':UNIT', $params->unit, PDO::PARAM_STR);
		$stmt->bindParam(':REQUIRED', $params->required, PDO::PARAM_BOOL);
		$stmt->bindParam(':DETAILS', $params->details, PDO::PARAM_STR);
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

		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.settings 
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}
}
