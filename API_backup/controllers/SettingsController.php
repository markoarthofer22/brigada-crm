<?php

namespace PP\Controller;

use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Settings;
use PP\Classes\Status;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * SettingsController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class SettingsController extends BaseController
{

	protected $unit;
	protected $langs;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();

		$this->unit = array("EUR" => "EUR", "CONF" => "CONF", "PERCENT" => "%");
		$this->langs = array("hr", "en", "si");
	}

	private function isJson($string)
	{
		json_decode($string);
		return json_last_error() === JSON_ERROR_NONE;
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
		$Language = new Language($this->db);
		$Status = new Status($this->db);
		$translations = !empty($Language->PrepareWords()) ? $Language->PrepareWords() : new stdClass;

		$settings = new stdClass;
		$settings->user = $_SESSION["user"];
		$settings->translations = $translations;
		$settings->sid =  $_SESSION["sid"];
		$settings->lang = $_SESSION["lang"];
		$settings->langs = $this->langs;
		$settings->defaultValues = array(
			'serverTableLimit' => 10000,
			'serverPerPage' => array(1000, 10000, 25000, 50000),
			'clientTableLimit' => 25,
			'clientPerPage' => array(10, 25, 50, 100),
		);

		$all_years = $Status->GetYears();
		if (!in_array(date('Y'), array_column($all_years, 'year'))) {
			array_unshift($all_years, ['year' => date('Y')]); // Add at the beginning
		}

		// $settings->years = array("2020", "2021", "2022", "2023", "2024", "2025");
		$settings->years = array_column($all_years, 'year');

		return $response->withJson($settings, 200);
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

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Settings = new Settings($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $Settings->Get();
		$results->unit = $this->unit;
		$results->validation = array(
			'ident' => array("required" => true),
			'val' => array("required" => true),
			'display' => array("required" => true),
			'unit' => array("required" => true),
			'required' => array("required" => false, "display" => false),
			'details' => array("required" => false),
		);
		$results->crud = array("create" => true, "update" => true, "delete" => true);

		return $response->withJson($results, 200);
	}

	/**
	 * Insert function
	 *
	 * @param Request $request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Insert(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Settings = new Settings($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'ident',
			'val',
			'display',
			'unit',
			// 'required',
			// 'details'
		];

		$params->required = $params->required ?? false;
		$params->details = $params->details ?? null;

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

		if ($params->details && !$Helper->isJson($params->details)) {
			return Message::WriteMessage(
				400,
				array("Message" => $Language->Translate(array("phrase" => "Details has to be valid JSON"))),
				$response
			);
		}

		$results = new stdClass;
		$results->data = $Settings->Insert($params);

		return $response->withJson($results, 200);
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
		$Helper = new Helper($this->db);
		$Settings = new Settings($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// Define the required parameters
		$requiredParams = [
			'ident',
			'val',
			'display',
			'unit',
			// 'required',
			// 'details'
		];

		$params->required = $params->required ?? false;
		$params->details = $params->details ?? null;

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

		if ($params->details && !$Helper->isJson($params->details)) {
			return Message::WriteMessage(
				400,
				array("Message" => $Language->Translate(array("phrase" => "Details has to be valid JSON"))),
				$response
			);
		}

		$results = new stdClass;
		$results->data = $Settings->Update($params);

		return $response->withJson($results, 200);
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
		$Helper = new Helper($this->db);
		$Settings = new Settings($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$results = new stdClass;
		$results->data = $Settings->Delete($params);

		return $response->withJson($results, 200);
	}
}
