<?php

namespace PP\Controller;

use PP\Classes\Countries;
use PP\Classes\Custom;
use PP\Classes\Depos;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Products;
use PP\Classes\Tours;
use PP\Classes\Types;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * CustomController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class CustomController extends BaseController
{

	protected $revcost;
	protected $currency;
	protected $assign;
	protected $country_type;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();

		$this->revcost = array("Revenue" => 0, "Cost" => 1);
		$this->currency = array("EUR" => "EUR", "HRK" => "HRK");
		$this->assign = array("Monhtly" => 1, "Daily" => 0);
		$this->country_type = array("Sender" => "scountry", "Receiver" => "rcountry");
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
		$Data = new Custom($this->db);
		$Products = new Products($this->db);
		$Types = new Types($this->db);
		$Depos = new Depos($this->db);
		$Tours = new Tours($this->db);
		$Countries = new Countries($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$params->date_from = isset($params->query->month) && $params->query->month != "" ? date("Y-m-01", strtotime($params->query->month)) : date("Y-m-01");
		$params->date_to = isset($params->query->month) && $params->query->month != "" ? date("Y-m-t", strtotime($params->query->month)) : date("Y-m-t");

		$results = new stdClass;
		$results->data = $Data->Get($params);
		$results->products = $Products->GetAll();
		$results->types = $Types->GetAll(array("manual" => true));
		$results->types_it4em = $Types->GetAll_IT4EM(array("nonprofit" => false));
		$results->depos = $Depos->GetAll();
		$results->tours = $Tours->GetAll();
		$results->countries = $Countries->GetAll();
		$results->revcost = $this->revcost;
		$results->currency = $this->currency;
		$results->assign = $this->assign;
		$results->country_type = $this->country_type;
		$results->validation = array(
			'date' => array("required" => true),
			'revcost' => array("required" => true),
			'type_id' => array("required" => true),
			'amount' => array("required" => true),
			'currency' => array("required" => true),
			'month' => array("required" => true),
			'product_id' => array("required" => false),
			'customerno' => array("required" => false),
			'depo' => array("required" => false),
			'tour' => array("required" => false),
			'country' => array("required" => false),
			'tcountry' => array("required" => false),
			'product' => array("required" => false),
			'calc' => array("required" => false, "readonly" => false),
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
		$Custom = new Custom($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'date',
			'revcost',
			'type_id',
			'amount',
			'currency',
			'month',
			// 'product_id',
			// 'customerno',
			// 'depo',
			// 'tour',
			// 'country',
			// 'tcountry',
			// 'product'
		];

		$params->product_id = $params->product_id ? $params->product_id : null;
		$params->customerno = $params->customerno && $params->customerno == "" ? null : $params->customerno;
		$params->depo = $params->depo ? $params->depo : null;
		$params->tour = $params->tour ? $params->tour : null;
		$params->country = $params->country ? $params->country : null;
		$params->tcountry = $params->tcountry ? $params->tcountry : null;
		$params->product = $params->product ? $params->product : null;
		$params->calc = $params->calc ? true : false;

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

		$parsedDate = strtotime($params->date);
		if ($parsedDate === false || !checkdate(date('m', $parsedDate), date('d', $parsedDate), date('Y', $parsedDate))) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date is malformed or invalid"))), $response);
		}

		$params->date = date("Y-m-d", strtotime($params->date));

		$results = new stdClass;
		$results->data = $Custom->Insert($params);

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
		$Custom = new Custom($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'date',
			'revcost',
			'type_id',
			'amount',
			'currency',
			'month',
			// 'product_id',
			// 'customerno',
			// 'depo',
			// 'tour',
			// 'country',
			// 'tcountry',
			// 'product'
		];

		$params->product_id = $params->product_id ? $params->product_id : null;
		$params->customerno = $params->customerno && $params->customerno == "" ? null : $params->customerno;
		$params->depo = $params->depo ? $params->depo : null;
		$params->tour = $params->tour ? $params->tour : null;
		$params->country = $params->country ? $params->country : null;
		$params->tcountry = $params->tcountry ? $params->tcountry : null;
		$params->product = $params->product ? $params->product : null;
		$params->calc = $params->calc ? true : false;

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

		$parsedDate = strtotime($params->date);
		if ($parsedDate === false || !checkdate(date('m', $parsedDate), date('d', $parsedDate), date('Y', $parsedDate))) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date is malformed or invalid"))), $response);
		}

		$params->date = date("Y-m-d", strtotime($params->date));

		$results = new stdClass;
		$results->data = $Custom->Update($params);

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

		$Helper = new Helper($this->db);
		$Custom = new Custom($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $Custom->Delete($params);

		return $response->withJson($results, 200);
	}
}
