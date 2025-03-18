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
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Login(object $params): array
	{

		$Helper = new Helper($this->database);
		$access_token = "";
		$refresh_token = "";

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

			$access_token = $this->GetAccessToken($result["id_users"]);
			$refresh_token = $this->GetRefreshToken($result["id_users"]);
		}

		return [
			"access_token" => $access_token,
			"refresh_token" => $refresh_token
		];
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

		$sql = "SELECT id_users FROM {$_SESSION["SCHEMA"]}.users_tokens WHERE id_users = :ID_USERS";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_USERS', $id);
		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if (empty($result)) {
			throw new Exception("Unauthorized", 1);
		}

		$sql = "SELECT 
					* 
				FROM {$_SESSION["SCHEMA"]}.users u
				WHERE 
					u.id_users = :ID_USERS
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_USERS', $id);
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
	 * RefreshToken function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function RefreshToken(string $token): array
	{

		$sql = "SELECT id_users FROM {$_SESSION["SCHEMA"]}.users_tokens WHERE refresh_token = :REFRESH_TOKEN AND expires_at > NOW()";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':REFRESH_TOKEN', $token);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		if ($result) {
			$access_token = $this->GetAccessToken($result["id_users"]);
			$refresh_token = $this->GetRefreshToken($result["id_users"]);
		}
		return [
			"access_token" => $access_token,
			"refresh_token" => $refresh_token
		];
	}


	/**
	 * GetAccessToken function
	 *
	 * @param int $id_users
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAccessToken(int $id_users): string
	{
		$accessPayload = [
			"iss" => $_ENV["DOMAIN"],
			"aud" => $_ENV["DOMAIN"],
			"iat" => time(),
			"exp" => strtotime("+1 month"),
			"user" => $id_users
		];
		$access_token = JWT::encode($accessPayload, $this->secret_key, 'HS256');
		return $access_token;
	}

	/**
	 * GetRefreshToken function
	 *
	 * @param int $id_users
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetRefreshToken(int $id_users): string
	{
		$refresh_token = bin2hex(random_bytes(32));

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.users_tokens 
					(id_users, refresh_token, expires_at) 
				VALUES 
					(:ID_USERS, :REFRESH_TOKEN, :EXPIRES_AT) 
				ON CONFLICT (id_users) 
				DO UPDATE SET 
					refresh_token = EXCLUDED.refresh_token, 
					expires_at = EXCLUDED.expires_at
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_USERS', $id_users);
		$stmt->bindParam(':REFRESH_TOKEN', $refresh_token);
		$stmt->bindParam(':EXPIRES_AT', date('Y-m-d H:i:s', strtotime("+3 months")));
		$stmt->execute();

		return $refresh_token;
	}

	/**
	 * Logout function
	 *
	 * @param int $id_users
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Logout(int $id_users): bool
	{
		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.users_tokens WHERE id_users = :ID_USERS";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_USERS', $id_users);
		$stmt->execute();
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
