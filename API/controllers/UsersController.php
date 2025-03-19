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
	 * GetLogedUser function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetLogedUser(Request $request, Response $response, array $args): Response
	{
		return $response->withJson($_SESSION["user"]);
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

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		if (!isset($params->username) || $params->username == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing username"))), $response);
		}

		if (!isset($params->password) || $params->password == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing password"))), $response);
		}

		$result = $User->Login($params);

		if ($result == "" || !is_array($result) || empty($result)) {
			$User->Logout(0);
			return Message::WriteMessage(401, array("Message" => $Language->Translate(array("phrase" => "Login error. Unathorized"))), $response);
		}

		return $response->withJson($result);
	}

	/**
	 * Logout function
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

		$id_users = $request->getAttribute("_user");
		$User->Logout($id_users);
		return $response->withStatus(204);
	}

	/**
	 * RefreshToken function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function RefreshToken(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$User = new Users($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		if (!isset($params->refresh_token) || $params->refresh_token == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing refresh token"))), $response);
		}

		$result = $User->RefreshToken($params->refresh_token);

		if (empty($result) || !is_array($result) || empty($result["access_token"]) || empty($result["refresh_token"])) {
			$User->Logout(0);
			return Message::WriteMessage(401, [
				"Message" => $Language->Translate(["phrase" => "Login error. Unauthorized"])
			], $response);
		}


		return $response->withJson($result);
	}

	/**
	 * __invoke function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __invoke(Request $request, Response $response, array $args): Response
	{
		$User = new Users($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);

		$results = $User->GetAll();

		return $response->withJson(array("results" => $results), 200);
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
		$User = new Users($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$results = $User->Get($args);

		return $response->withJson($results, 200);
	}

	/**
	 * Add function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Add(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$User = new Users($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		if (!isset($params->data->email) || $params->data->email == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing email"))), $response);
		}
		if (!isset($params->data->firstname) || $params->data->firstname == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing firstname"))), $response);
		}
		if (!isset($params->data->lastname) || $params->data->lastname == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing lastname"))), $response);
		}
		if (!isset($params->data->password) || $params->data->password == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing password"))), $response);
		}

		$params->admin = (int) !empty($params->admin);
		$params->data->password = md5($params->data->password);

		try {
			$id = $User->Add($params);
		} catch (\Throwable $th) {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Existing user"))), $response);
		}
		$result = $User->Get((object) array("id" => $id));

		return $response->withJson($result, 201);
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
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		if (!isset($params->data->email) || $params->data->email == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing email"))), $response);
		}
		if (!isset($params->data->firstname) || $params->data->firstname == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing firstname"))), $response);
		}
		if (!isset($params->data->lastname) || $params->data->lastname == "") {
			return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing lastname"))), $response);
		}
		// if (!isset($params->data->password) || $params->data->password == "") {
		// 	return Message::WriteMessage(422, array("Message" => $Language->Translate(array("phrase" => "Missing password"))), $response);
		// }

		$params->admin = (int) !empty($params->admin);

		$params->id = $args->id;
		if ($params->data->password && $params->data->password != "") {
			$params->data->password = md5($params->data->password);
		} else {
			unset($params->data->password);
		}

		if ($User->Update($params)) {
			return $response->withStatus(204);
		} else {
			return Message::WriteMessage(520, array("Message" => $Language->Translate(array("phrase" => "Unknown error"))), $response);
		}
	}


	/**
	 * Delete function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Delete(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$User = new Users($this->db);
		$Helper = new Helper($this->db);

		$vars = $request->getParsedBody();
		$params = $Helper->ArrayToObject($vars);
		$args = $Helper->ArrayToObject($args);

		$User->Delete($args);

		return $response->withStatus(204);
	}
}
