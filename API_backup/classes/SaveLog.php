<?php

namespace PP\Classes;

use PDO;

/**
 * SaveLog class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class SaveLog
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

	public function Write($path, $parsedBody, $queryParams, $method)
	{
		$sql = "INSERT 
				INTO logs 
				SET 
					id_user = :ID_USER,
					user = :USER,
					path = :PATH,
					parsed_body = :PARSED_BODY,
					query_params = :QUERY_PARAMS,
					method = :METHOD,
					created_at = NOW()
		";
		$stmt = $this->database->prepare($sql);

		$user = $_SESSION["cms_user"] ? $_SESSION["cms_user"]->firstname . " " . $_SESSION["cms_user"]->lastname : null;
		if (is_array($parsedBody) || is_object($parsedBody)) {
			$parsedBody = json_encode($parsedBody);
		}
		$queryParams = json_encode($queryParams);

		$id_cms_users = $_SESSION["cms_user"] && isset($_SESSION["cms_user"]->id_cms_users) ? $_SESSION["cms_user"]->id_cms_users : null;

		$stmt->bindParam("ID_USER", $id_cms_users);
		$stmt->bindParam("USER", $user);
		$stmt->bindParam("PATH", $path);
		$stmt->bindValue("PARSED_BODY", $parsedBody);
		$stmt->bindValue("QUERY_PARAMS", $queryParams);
		$stmt->bindParam("METHOD", $method);
		$stmt->execute();

		$_SESSION["LID"] = $this->database->lastInsertId();
	}

	public function Update($id, $responseCode, $response)
	{
		$sql = "UPDATE logs SET response = :RESPONSE, response_code = :RESPONSE_CODE WHERE id_logs = :ID_LOGS";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam("ID_LOGS", $id);
		$stmt->bindParam("RESPONSE", $response);
		$stmt->bindParam("RESPONSE_CODE", $responseCode);
		$stmt->execute();
		unset($_SESSION["LID"]);
	}
}
