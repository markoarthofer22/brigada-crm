<?php

namespace PP\Controller;

use PP\Classes\Countries;
use PP\Classes\Custom;
use PP\Classes\ExportLinehaul;
use PP\Classes\Depos;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Hubs;
use PP\Classes\Message;
use PP\Classes\Types;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * ExportLinehaulController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class ExportLinehaulController extends BaseController
{

	protected $currency;
	protected $assign;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
		$this->currency = array("EUR" => "EUR", "HRK" => "HRK");
		$this->assign = array("Monhtly" => 1, "Daily" => 0);
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

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$ExportLinehaul = new ExportLinehaul($this->db);
		$Types = new Types($this->db);
		$Depos = new Depos($this->db);
		$Hubs = new Hubs($this->db);
		$Countries = new Countries($this->db);

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

		$results = new stdClass;
		$results->data = $ExportLinehaul->Get($params);
		$results->types = $Types->GetAll(array("id" => array(29, 32)));
		$results->depos = $Depos->GetAll();
		$results->hubs = $Hubs->GetAll();
		$results->countries = $Countries->GetAll();
		$results->currency = $this->currency;
		$results->assign = $this->assign;
		$results->validation = array(
			'date' => array("required" => true),
			'amount' => array("required" => true),
			'currency' => array("required" => true),
			'percent' => array("required" => true),
			'country' => array("required" => true),
			'sdepo' => array("required" => true),
			'rdepo' => array("required" => true),
			'month' => array("required" => true),
			'type_id' => array("required" => true),
			'ident' => array("required" => true),
			'customerno' => array("required" => false),
			'import_parcels' => array("required" => false),
			'calc' => array("required" => false, "readonly" => true),
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
		$ExportLinehaul = new ExportLinehaul($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'date',
			'amount',
			'currency',
			'percent',
			'country',
			'sdepo',
			'rdepo',
			'month',
			'type_id',
			'ident',
			// 'customerno',
			// 'import_parcels'
		];

		$params->customerno = $params->customerno ?? null;
		$params->import_parcels = $params->import_parcels ?? false;

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
		$results->data = $ExportLinehaul->Insert($params);

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
		$ExportLinehaul = new ExportLinehaul($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'date',
			'amount',
			'currency',
			'percent',
			'country',
			'sdepo',
			'rdepo',
			'month',
			'type_id',
			'ident'
		];

		$params->customerno = $params->customerno ?? null;
		$params->import_parcels = $params->import_parcels ?? false;

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
		$results->data = $ExportLinehaul->Update($params);

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
		$ExportLinehaul = new ExportLinehaul($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $ExportLinehaul->Delete($params);

		return $response->withJson($results, 200);
	}
}
