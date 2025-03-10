<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Logs class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Logs
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
	 * Insert function
	 *
	 * @return int
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Insert(array $params): int
	{

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}._logs 
				(module, module_name, description, command, output) 
				VALUES 
				(:MODULE, :MODULE_NAME, :DESCRIPTION, :COMMAND, :OUTPUT)
				RETURNING id
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':MODULE', $params["module"], PDO::PARAM_INT);
		$stmt->bindParam(':MODULE_NAME', $params["module_name"], PDO::PARAM_STR);
		$stmt->bindParam(':DESCRIPTION', $params["description"], PDO::PARAM_STR);
		$stmt->bindParam(':COMMAND', $params["command"], PDO::PARAM_STR);
		$stmt->bindParam(':OUTPUT', $params["output"], PDO::PARAM_STR);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return (int)$result['id'];
	}

	/**
	 * Update function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(array $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}._logs 
				SET 
					output = :OUTPUT,
					execution_time = EXTRACT(EPOCH FROM (now() - created_at)) * 1000
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':OUTPUT', $params["output"], PDO::PARAM_STR);
		$stmt->bindParam(':ID', $params["id"], PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}
}
