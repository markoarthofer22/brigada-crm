<?php

namespace PP\Controller;

use Exception;
use PDO;
use PDOException;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Payment;
use PP\Classes\Test;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * TestController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class TestController extends BaseController
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

	public function Get(Request $request, Response $response, array $args): Response
	{
		$Helper = new Helper($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		return $response->withStatus(200);
	}

	public function PP(Request $request, Response $response, array $args): Response
	{
		$Helper = new Helper($this->db);
		$Test = new Test($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$result = $Test->PP($params);
		return $response->withJson($result, 200);
	}

	public function Info(Request $request, Response $response, array $args)
	{
		phpinfo();
		exit;
	}

	public function oci(Request $request, Response $response, array $args)
	{
		try {
			$dsn = 'oci:dbname=' . $_ENV["IT4EM_CONNSTR"];
			$dbuser = $_ENV["IT4EM_USER"];
			$dbpass = $_ENV["IT4EM_PASSWORD"];

			$pdo = new PDO($dsn, $dbuser, $dbpass);
			echo "Connected successfully!";
		} catch (PDOException $e) {
			echo "<pre>";
			print_r($e);
			// echo "Connection failed: " . $e->getMessage();
		}
		exit;
	}
}
