<?php

namespace PP\Controller;

use PP\Classes\Activites;
use PP\Classes\Countries;
use PP\Classes\Detailed;
use PP\Classes\Salespeople;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Sources;
use PP\Classes\LinehaulRoutes;
use PP\Classes\Message;
use PP\Classes\Products;
use PP\Classes\Status;
use PP\Classes\Tours;
use PP\Classes\Types;
use PP\Classes\Users;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * LinehaulController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class StatusController extends BaseController
{

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
	}

	/**
	 * Get function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Status = new Status($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->validation = array(
			'date_from' => array("required" => true),
			'date_to' => array("required" => true)
		);

		if (!isset($params->query->date_from) || $params->query->date_from == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date from missing"))), $response);
		}

		if (!isset($params->query->date_to) || $params->query->date_to == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date to missing"))), $response);
		}

		$results->crud = array("create" => false, "update" => true, "delete" => false);
		$results->data = $Status->GetAll($params);
		$results->years = $Status->GetYears();

		if ($results->data["Error"]) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Please refine search parameters"))), $response);
		}

		return $response->withJson($results, 200);
	}


	/**
	 * Update function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Status = new Status($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;

		if (!isset($params->action) || !in_array(strtolower($params->action), array_map('strtolower', ["Start", "Resume", "End", "Skip", "Restart"]))) {
			return Message::WriteMessage(
				400,
				array("Message" => $Language->Translate(array("phrase" => "Action missing or invalid"))),
				$response
			);
		}

		if ($params->action == "start") {
			$results->data = $Status->Start($params);
		}

		if ($params->action == "resume") {
			$results->data = $Status->Resume($params);
		}

		if ($params->action == "end") {
			$results->data = $Status->End($params);
		}

		if ($params->action == "skip") {
			$results->data = $Status->Skip($params);
		}

		if ($params->action == "restart") {
			$results->data = $Status->Restart($params);
		}

		if (!$results->data) {
			return Message::WriteMessage(
				400,
				array("Message" => $Language->Translate(array("phrase" => "Something went wrong!"))),
				$response
			);
		}

		return $response->withJson($results, 200);
	}
}
