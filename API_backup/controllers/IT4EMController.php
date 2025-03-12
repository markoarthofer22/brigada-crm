<?php

namespace PP\Controller;

use PP\Classes\Countries;
use PP\Classes\IT4EM;
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
 * IT4EMController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class IT4EMController extends BaseController
{

	protected $prod_types;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
		$this->prod_types = array("Main" => 0, "AdditionalP" => 1);
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
		$IT4EM = new IT4EM($this->db);
		$Products = new Products($this->db);
		$Types = new Types($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $IT4EM->Get($params);
		$results->products = $Products->GetAll();
		$results->types = $Types->GetAll();
		$results->types_it4em = $Types->GetAll_IT4EM();
		$results->prod_types = $this->prod_types;
		$results->validation = array(
			'prod' => array("required" => true, "readonly" => true),
			'prod_name' => array("required" => true, "readonly" => true),
			'prod_type' => array("required" => true, "readonly" => true),
			'type_id' => array("required" => true),
			'product_id' => array("required" => false),
			'nonprofit' => array("required" => false),
		);
		$results->crud = array("create" => false, "update" => true, "delete" => false);

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
		$IT4EM = new IT4EM($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'prod',
			'prod_name',
			'prod_type',
			'type_id',
			// 'product_id',
			// 'nonprofit'
		];

		$params->product_id = $params->product_id ?? null;
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
		$results->data = $IT4EM->Insert($params);

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
		$IT4EM = new IT4EM($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'prod',
			'prod_name',
			'prod_type',
			'type_id'
		];

		$params->product_id = $params->product_id ?? null;
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
		$results->data = $IT4EM->Update($params);

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
		$IT4EM = new IT4EM($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $IT4EM->Delete($params);

		return $response->withJson($results, 200);
	}
}
