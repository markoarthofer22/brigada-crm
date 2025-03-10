<?php

namespace PP\Controller;

use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Users;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * UsersController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class UsersController extends BaseController
{

	protected $login_error;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();

		$this->login_error = 0;
	}

	/**
	 * Get function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(Request $request, Response $response, array $args): Response
	{
		return $response->withJson($_SESSION["USER"]);
	}

	/**
	 * Login function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Login(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$User = new Users($this->db);

		// if (!$vars["username"] || $vars["username"] == "" || $vars["username"] == NULL) {
		// 	return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Data missing (email)"))), $response);
		// }
		// if (!$vars["password"] || $vars["password"] == "" || $vars["password"] == NULL) {
		// 	return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Data missing (password)"))), $response);
		// }

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// echo "<pre>";
		// print_r($params);
		// exit;

		if (!isset($params->username) || $params->username == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Missing username"))), $response);
		}

		if (!isset($params->password) || $params->password == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Missing password"))), $response);
		}

		$user = $User->Login($params);

		if ($user == array()) {
			$User->Logout();
			return Message::WriteMessage(401, array("Message" => $Language->Translate(array("phrase" => "Unathorized"))), $response);
		}

		// $User->UserSession($user->id_cms_users);
		return $response->withJson($_SESSION["user"]);
	}

	/**
	 * Login function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Logout(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$User = new Users($this->db);

		if ($User->Logout()) {
			return $response->withJson($_SESSION);
			return Message::WriteMessage(200, array("Message" => $Language->Translate(array("phrase" => "Success"))), $response);
		} else {
			return Message::WriteMessage(520, array("Message" => $Language->Translate(array("phrase" => "Unknown error"))), $response);
		}
	}

	/**
	 * Update function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$User = new Users($this->db);

		$vars = $request->getParsedBody();
		$params = (object)$vars;

		if ($User->Update($params)) {
			return Message::WriteMessage(200, array("Message" => $Language->Translate(array("phrase" => "User updated"))), $response);
		} else {
			return Message::WriteMessage(520, array("Message" => $Language->Translate(array("phrase" => "Unknown error"))), $response);
		}
	}

	/**
	 * GetUsers function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetUsers(Request $request, Response $response, array $args): Response
	{

		$User = new Users($this->db);
		$Helper = new Helper($this->db);

		$queryparams = $Helper->ArrayToObject($request->getQueryParams());
		$results = $User->GetUsers($queryparams);

		return $response->withJson($results, 200);
	}

	/**
	 * GetUser function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetUser(Request $request, Response $response, array $args): Response
	{

		$User = new Users($this->db);

		$result = $User->GetUser($args["id"]);
		$result->addresses = $User->GetUserAddresses($args["id"]);

		return $response->withJson($result, 200);
	}

	/**
	 * CreateUser function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function CreateUser(Request $request, Response $response, array $args): Response
	{

		$User = new Users($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);

		$id = $User->CreateUser($params);

		$result = $User->GetUser($id);
		$result->addresses = $User->GetUserAddresses($id);

		return $response->withJson($result, 200);
	}

	/**
	 * UpdateUser function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function UpdateUser(Request $request, Response $response, array $args): Response
	{

		$User = new Users($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$params->id_users = $args["id"];

		$User->UpdateUser($params);

		$result = $User->GetUser($args["id"]);
		$result->addresses = $User->GetUserAddresses($args["id"]);

		return $response->withJson($result, 200);
	}

	/**
	 * DeleteUser function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function DeleteUser(Request $request, Response $response, array $args): Response
	{

		$User = new Users($this->db);

		$User->DeleteUser($args["id"]);
		$User->DeleteUserAddresses($args["id"]);

		return $response->withStatus(204);
	}
}
