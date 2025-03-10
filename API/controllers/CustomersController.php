<?php

namespace PP\Controller;

use PP\Classes\Countries;
use PP\Classes\Custom;
use PP\Classes\Customers;
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
 * CustomersController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class CustomersController extends BaseController
{

	protected $limit;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
		$this->limit = 50;
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
		$Customers = new Customers($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$params->limit = $params->query->limit > 0 ? $params->query->limit : $this->limit;
		$params->page = $params->query->page > 0 ? $params->query->page : 1;

		$results = new stdClass;
		$results->data = $Customers->GetAll($params);

		return $response->withJson($results, 200);
	}
}
