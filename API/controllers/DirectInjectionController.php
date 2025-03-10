<?php

namespace PP\Controller;

use PP\Classes\Countries;
use PP\Classes\DirectInjection;
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
 * DirectInjectionController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class DirectInjectionController extends BaseController
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
	public function Get(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Data = new DirectInjection($this->db);

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
		$results->data = $Data->Get($params);
		$results->validation = array(
			'customer_name' => array("required" => false, "readonly" => true),
			'date' => array("required" => false, "readonly" => true),
			'invoice' => array("required" => false, "readonly" => true),
			'parcelno' => array("required" => false, "readonly" => true),
			'name' => array("required" => false, "readonly" => true),
			'country_name' => array("required" => false, "readonly" => true),
			'amount' => array("required" => false, "readonly" => true),
			'currency' => array("required" => false, "readonly" => true),
			'count' => array("required" => true),
		);

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
		$Data = new DirectInjection($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// if (!isset($params->id) || $params->id == "") {
		// 	return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "ID missing"))), $response);
		// }

		if (!isset($params->count) || $params->count == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Count missing"))), $response);
		}

		$Data->Update($params);

		return $response->withJson(new stdClass, 200);
	}
}
