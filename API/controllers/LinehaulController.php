<?php

namespace PP\Controller;

use PP\Classes\Activites;
use PP\Classes\Countries;
use PP\Classes\Linehaul;
use PP\Classes\Depos;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\LinehaulDepos;
use PP\Classes\LinehaulRoutes;
use PP\Classes\Message;
use PP\Classes\Products;
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
class LinehaulController extends BaseController
{

	protected $linehaul_types;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
		$this->linehaul_types = array("Average" => "avg", "Daily" => "daily");
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
	public function Get(Request $request, Response $response, array $args): Response
	{

		$Helper = new Helper($this->db);
		$Linehaul = new Linehaul($this->db);
		$LinehaulRoutes = new LinehaulRoutes($this->db);
		$LinehaulDepos = new LinehaulDepos($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $Linehaul->Get($params);
		$results->routes = $LinehaulRoutes->GetAll();
		$results->depos = $LinehaulDepos->GetAll();
		$results->validation = array(
			'route_id' => array("required" => true),
			'sdepo' => array("required" => true),
			'rdepo' => array("required" => true),
			'percent' => array("required" => true),
		);
		$results->crud = array("create" => true, "update" => true, "delete" => true);

		return $response->withJson($results, 200);
	}

	/**
	 * Insert function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Insert(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Linehaul = new Linehaul($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'route_id',
			'sdepo',
			'rdepo',
			'percent'
		];

		// Loop through the required parameters and check each one
		foreach ($requiredParams as $param) {
			if (!isset($params->$param) || $params->$param == "") {
				return Message::WriteMessage(
					400,
					array("Message" => $Language->Translate(array("phrase" => $param . " missing"))),
					$response
				);
			}
		}

		$results = new stdClass;
		$results->data = $Linehaul->Insert($params);

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
		$Linehaul = new Linehaul($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'route_id',
			'sdepo',
			'rdepo',
			'percent'
		];

		// Loop through the required parameters and check each one
		foreach ($requiredParams as $param) {
			if (!isset($params->$param) || $params->$param == "") {
				return Message::WriteMessage(
					400,
					array("Message" => $Language->Translate(array("phrase" => $param . " missing"))),
					$response
				);
			}
		}

		$results = new stdClass;
		$results->data = $Linehaul->Update($params);

		return $response->withJson($results, 200);
	}

	/**
	 * Delete function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Delete(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Linehaul = new Linehaul($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $Linehaul->Delete($params);

		return $response->withJson($results, 200);
	}

	/**
	 * GetAverage function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAverage(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Linehaul = new Linehaul($this->db);
		$LinehaulRoutes = new LinehaulRoutes($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		if (!isset($params->query->date_from) || $params->query->date_from == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date from missing"))), $response);
		}

		if (!isset($params->query->date_to) || $params->query->date_to == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date to missing"))), $response);
		}

		if (!isset($params->query->type) || $params->query->type == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Show type missing"))), $response);
		}

		if (!isset($params->query->linehaul) || $params->query->linehaul == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Linehaul type missing"))), $response);
		}

		$results = new stdClass;
		$results->data = $Linehaul->GetAverage($params);
		$results->domestic_routes = $LinehaulRoutes->GetAll();
		$results->export_routes = $LinehaulRoutes->GetAllExport();
		$results->validation = array(
			'id' => array("required" => true, "display" => false),
			'date_from' => array("required" => true),
			'date_to' => array("required" => true),
			'route' => array("required" => false),
			'type' => array("required" => true),
			'linehaul' => array("required" => true),
		);
		$results->crud = array("create" => false, "update" => false, "delete" => false);
		$results->linehaul_types = $this->linehaul_types;

		return $response->withJson($results, 200);
	}
}
