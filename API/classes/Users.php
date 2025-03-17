<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * Users class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Users
{

	protected $database;
	protected $ldapServer;
	protected $ldapDomain;
	protected $secret_key;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		$this->database = $db;
		$this->secret_key = $_ENV["JWT_SECRET"];
	}


	/**
	 * GetAll function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll(): array
	{

		$Helper = new Helper($this->database);

		$sql = "SELECT 
					* 
				FROM {$_SESSION["SCHEMA"]}.users u
				ORDER BY u.firstname
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();

		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		foreach ($results as &$result) {
			$result["data"] = json_decode($result["data"]);
			unset($result["password"]);
			unset($result["data"]->password);
		}
		return $results;
	}

	/**
	 * Get function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(object $params): array
	{
		$Helper = new Helper($this->database);

		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.users u WHERE 1=1";

		if ($params->id) {
			$sql .= " AND u.id_users = :ID";
		}
		if (!empty($params->email)) {
			$sql .= " AND u.email = :EMAIL";
		}

		$stmt = $this->database->prepare($sql);

		if ($params->id) {
			$stmt->bindParam(':ID', $params->id, PDO::PARAM_INT);
		}
		if (!empty($params->email)) {
			$stmt->bindParam(':EMAIL', $params->email, PDO::PARAM_STR);
		}

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result) {
			$result["data"] = json_decode($result["data"]);
			unset($result["password"]);
			unset($result["data"]->password);
			$_SESSION["user"] = $result;
		}

		return $result ?: [];
	}


	/**
	 * Add function
	 *
	 * @param object $params
	 * @return int
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Add(object $params): int
	{

		$user = $this->Get((object) array("email" => $params->data->email));

		if ($user) {
			throw new Exception("User with email " . $params->data->email . " already exists", 400);
		}

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.users 
					(data, admin) 
				VALUES 
					(:DATA, :ADMIN)
				RETURNING id_users
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->bindParam(':ADMIN', $params->admin);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return (int)$result['id_users'];
	}

	/**
	 * Update function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.users 
				SET 
					data = :DATA, 
					admin = :ADMIN
				WHERE id_users = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->bindParam(':ADMIN', $params->admin);
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
	}


	/**
	 * Delete function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Delete(object $params): bool
	{
		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.users 
				WHERE id_users = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
	}

	/**
	 * Login function
	 *
	 * @param object $params
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Login(object $params): string
	{

		$Helper = new Helper($this->database);
		$jwt = "";

		$sql = "SELECT 
					* 
				FROM {$_SESSION["SCHEMA"]}.users u
				WHERE 
					u.email = :EMAIL
					AND u.password = MD5(:PASSWORD)
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':EMAIL', $params->username);
		$stmt->bindParam(':PASSWORD', $params->password);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		if ($result) {
			$result["data"] = json_decode($result["data"]);
			unset($result["password"]);
			unset($result["data"]->password);
			// $_SESSION["user"] = $result;

			$payload = [
				"iss" => $_ENV["DOMAIN"],
				"aud" => $_ENV["DOMAIN"],
				"iat" => time(),
				"exp" => strtotime("+1 year"), // Token expires in 1 year
				"user" => $result["id_users"]
			];

			$jwt = JWT::encode($payload, $this->secret_key, 'HS256');
		}


		return $jwt;
	}


	/**
	 * LoginWithID function
	 *
	 * @param object $params
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function LoginWithID(int $id): bool
	{

		$sql = "SELECT 
					* 
				FROM {$_SESSION["SCHEMA"]}.users u
				WHERE 
					u.id_users = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $id);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		if ($result) {
			$result["data"] = json_decode($result["data"]);
			unset($result["password"]);
			unset($result["data"]->password);
			$_SESSION["user"] = $result;
		}

		// print_r($_SESSION["user"]);

		return true;
	}


	/**
	 * Logout function
	 *
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Logout(): bool
	{
		unset($_SESSION["user"]);
		return true;
	}


	/**
	 * isUserLogedIn function
	 *
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function isUserLogedIn(): bool
	{
		return isset($_SESSION["user"]) && $_SESSION["user"] != null ? true : false;
	}
}
