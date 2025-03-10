<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * SMM class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class SMM
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
				FROM {$_SESSION["SCHEMA"]}.smm_type_mapping t
				ORDER by t.id
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

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.smm_type_mapping 
				(type, name, ativity_id, type_id, nonprofit, description) 
				VALUES 
				(:TYPE, :NAME, :ACTIVITY_ID, :TYPE_ID, :NONPROFIT, :DESCRIPTION)
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':TYPE', $params->type, PDO::PARAM_INT);
		$stmt->bindParam(':NAME', $params->name, PDO::PARAM_STR);
		$stmt->bindParam(':ACTIVITY_ID', $params->activity_id, PDO::PARAM_INT);
		$stmt->bindParam(':TYPE_ID', $params->type_id, PDO::PARAM_INT);
		$stmt->bindParam(':NONPROFIT', $params->nonprofit, PDO::PARAM_BOOL);
		$stmt->bindParam(':DESCRIPTION', $params->description, PDO::PARAM_STR);
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

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.smm_type_mapping
				SET 
					type_id = :TYPE_ID,
					nonprofit = :NONPROFIT
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
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

		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.smm_type_mapping 
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}
}
