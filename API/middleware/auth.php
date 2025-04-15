<?php

namespace PP\Middleware;

use Exception;
use PDO;
use PP\Classes\Database;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Users;
use Slim\Http\Request;
use Slim\Http\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

/**
 * Auth class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Auth
{

	protected $secret_key;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		$this->secret_key = $_ENV["JWT_SECRET"];
	}

	/**
	 * Auth function
	 *
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Auth(Request $request, Response $response, $next): Response
	{
		$db = Database::Connection($_SESSION["database_suffix"]);
		$User = new Users($db);
		$Language = new Language($db);

		$headers = apache_request_headers();
		$token = trim(str_replace("Bearer", "", $headers["Authorization"] ? $headers["Authorization"] : $headers["authorization"]));

		if (!$token) {
			return Message::WriteMessage(401, array("Message" => $Language->Translate(array("phrase" => "Token not provided"))), $response);
		}

		try {
			$decoded = JWT::decode($token, new Key($this->secret_key, 'HS256'));
			$user = $decoded->user;
			$User->LoginWithID($user);
			$request = $request->withAttribute("_user", $user);
		} catch (ExpiredException $e) {
			return Message::WriteMessage(401, array("Message" => $Language->Translate(array("phrase" => "Token expired. Unauthorized"))), $response);
		} catch (Exception $e) {
			return Message::WriteMessage(401, array("Message" => $Language->Translate(array("phrase" => "Unathorized. Token probably not provided or malformed. " . $e->getMessage()))), $response);
		}

		if (!$User->isUserLogedIn()) {
			return Message::WriteMessage(401, array("Message" => $Language->Translate(array("phrase" => "Unathorized."))), $response);
		}

		$response = $next($request, $response);

		return $response;
	}
}
