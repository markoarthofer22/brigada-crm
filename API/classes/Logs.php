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


	public function Write($path, $parsedBody, $queryParams, $method)
	{

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.logs
					(\"user\", path, \"parsed_body\", \"query_params\", method, created_at)
				VALUES 
					(:USER, :PATH, :PARSEDBODY, :QUERYPARAMS, :METHOD, NOW())
				RETURNING \"id_logs\"
		";

		$stmt = $this->database->prepare($sql);

		if (is_string($parsedBody) && json_decode($parsedBody) !== null && json_last_error() === JSON_ERROR_NONE) {
			// Already valid JSON string
			$pb = $parsedBody;
		} else {
			// Not JSON, encode it
			$pb = json_encode($parsedBody);
		}

		if (is_string($queryParams) && json_decode($queryParams) !== null && json_last_error() === JSON_ERROR_NONE) {
			// Already valid JSON string
			$qp = $queryParams;
		} else {
			// Not JSON, encode it
			$qp = json_encode($queryParams);
		}

		$stmt->bindParam(":USER", json_encode($_SESSION["user"]));
		$stmt->bindParam(":PATH", $path);
		$stmt->bindValue(":PARSEDBODY", $pb);
		$stmt->bindValue(":QUERYPARAMS", $qp);
		$stmt->bindParam(":METHOD", $method);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		return (int)$result['id_logs'];
	}

	public function Update($id, $responseCode, $response)
	{

		if (is_string($response) && json_decode($response) !== null && json_last_error() === JSON_ERROR_NONE) {
			// Already valid JSON string
			$res = $response;
		} else {
			// Not JSON, encode it
			$res = json_encode($response);
		}

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.logs SET response = :RESPONSE, response_code = :RESPONSECODE WHERE id_logs = :ID";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(":ID", $id);
		$stmt->bindParam(":RESPONSE", $res);
		$stmt->bindParam(":RESPONSECODE", $responseCode);
		$stmt->execute();

		return true;
	}
}
