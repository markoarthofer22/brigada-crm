<?php

namespace PP\Controller;

use PP\Classes\Countries;
use PP\Classes\ICS;
use PP\Classes\Depos;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Products;
use PP\Classes\Tours;
use PP\Classes\Types;
use PP\Classes\Users;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * ICSController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class ICSController extends BaseController
{

	protected $range_types;
	protected $revcost;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
		$this->range_types = array("Domestic" => 0, "Other" => 1);
		$this->revcost = array("CREDIT" => 'CREDIT', "DEBIT" => 'DEBIT', "ODOBRENJE" => 'ODOBRENJE');
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
		$ICS = new ICS($this->db);
		$Products = new Products($this->db);
		$Types = new Types($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $ICS->Get($params);
		$results->products = $Products->GetAll();
		$results->types = $Types->GetAll();
		$results->range_types = $this->range_types;
		$results->revcost = $this->revcost;
		$results->validation = array(
			'process' => array("required" => true, "readonly" => false),
			'revcost' => array("required" => true, "readonly" => false),
			'range' => array("required" => true, "readonly" => false),
			'product_id' => array("required" => false),
			'type_id' => array("required" => false),
			'nonprofit' => array("required" => false),
		);
		$results->crud = array("create" => true, "update" => true, "delete" => false);

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
		$ICS = new ICS($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'process',
			'revcost',
			'range',
			// 'product_id',
			// 'type_id',
			// 'nonprofit'
		];

		$params->product_id = $params->product_id ?? null;
		$params->type_id = $params->type_id ?? null;
		$params->nonprofit = $params->nonprofit ?? false;

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
		$results->data = $ICS->Insert($params);

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
		$ICS = new ICS($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'process',
			'revcost',
			'range'
		];

		$params->product_id = $params->product_id ?? null;
		$params->type_id = $params->type_id ?? null;
		$params->nonprofit = $params->nonprofit ?? false;

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
		$results->data = $ICS->Update($params);

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
		$ICS = new ICS($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $ICS->Delete($params);

		return $response->withJson($results, 200);
	}
}
