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

/**
 * Auth class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Auth
{

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

		// if (!$token) {
		// 	return Message::WriteMessage(401, array("Message" => $Language->Translate(array("phrase" => "Token not provided"))), $response);
		// }

		// if ($token) {
		// 	$login = $user->LoginWithToken($token);
		// 	if ($login != new stdClass) {
		// 		$user->UserSession($login->id_cms_users);
		// 	} else {
		// 		$user->Logout();
		// 	}
		// }

		if (!$User->isUserLogedIn()) {
			return Message::WriteMessage(401, array("Message" => $Language->Translate(array("phrase" => "Unathorized"))), $response);
		}

		$response = $next($request, $response);

		return $response;
	}
}
