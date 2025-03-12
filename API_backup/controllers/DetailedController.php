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
use PP\Classes\Tours;
use PP\Classes\Types;
use PP\Classes\Users;
use RuntimeException;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;
use Shuchkin\SimpleXLSXGen;

/**
 * LinehaulController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class DetailedController extends BaseController
{

	protected $pre_invoice;
	protected $revcost;
	protected $b2bc;
	protected $it4em_display;
	protected $it4em_type;
	protected $group_by;
	protected $limit;
	protected $temp_folder;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
		$this->pre_invoice = array(
			array("name" => "Yes", "value" => 1),
			array("name" => "No", "value" => 2)
		);
		$this->revcost = array(
			array("name" => "Revenue", "value" => 0),
			array("name" => "Cost", "value" => 1)
		);
		$this->b2bc = array(
			array("name" => "B2B", "value" => 0),
			array("name" => "B2C", "value" => 1)
		);
		$this->it4em_display = array(
			array("name" => "Samo odabrani produkt", "value" => 1),
			array("name" => "Svi troškovi/prihodi koji sadrže produkt", "value" => 2)
		);
		$this->it4em_type = array(
			array("name" => "Main", "value" => 0),
			array("name" => "AdditionalP", "value" => 1)
		);
		$this->group_by = array(
			array("name" => "Product", "value" => "product"),
			array("name" => "Type", "value" => "type"),
			array("name" => "Source", "value" => "source"),
			array("name" => "Depot", "value" => "depot"),
			array("name" => "Tour", "value" => "tour")
		);
		$this->limit = 10000;
		$this->temp_folder = "../files/temp";

		if (!is_dir($this->temp_folder)) {
			mkdir($this->temp_folder, 0777, true);
			chmod($this->temp_folder, 0777);
		}
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
		$Detailed = new Detailed($this->db);
		$Tours = new Tours($this->db);
		$Types = new Types($this->db);
		$Products = new Products($this->db);
		$Sources = new Sources($this->db);
		$Countries = new Countries($this->db);
		$Salespeople = new Salespeople($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$params->limit = $params->group_by ? 1234567890 : ($params->query->limit > 0 ? $params->query->limit : $this->limit);
		$params->page = $params->group_by ? 1 : ($params->query->page > 0 ? $params->query->page : 1);

		foreach ($params as $key => $param) {
			if (!is_array($param) && !is_object($param)) {
				$params->$key = trim($param);
			}
		}

		if ($params->preinvoice == "yes") $params->preinvoice = 1;
		if ($params->preinvoice == "no") $params->preinvoice = 0;

		$params->group_by = (array)$params->group_by;
		$params->depot = (array)$params->depot;
		$params->tour = (array)$params->tour;
		$params->product_id = (array)$params->product_id;
		$params->type_id = (array)$params->type_id;
		$params->source_id = (array)$params->source_id;
		$params->scountry = (array)$params->scountry;
		$params->rcountry = (array)$params->rcountry;
		$params->it4em_product = (array)$params->it4em_product;
		// print_r($params);
		// exit;

		$results = new stdClass;
		$results->params = $params;
		// $results->validation = array(
		// 	'date_from' => array("required" => true),
		// 	'date_to' => array("required" => true),
		// 	'it4em_display' => array("required" => true),
		// 	'customerno' => array("required" => false),
		// 	'parcelno' => array("required" => false),
		// 	'depot' => array("required" => false),
		// 	'tour' => array("required" => false),
		// 	'product_id' => array("required" => false),
		// 	'type_id' => array("required" => false),
		// 	'source_id' => array("required" => false),
		// 	'revcost' => array("required" => false),
		// 	'preinvoice' => array("required" => false),
		// 	'sales_id' => array("required" => false),
		// 	'scountry' => array("required" => false),
		// 	'rcountry' => array("required" => false),
		// 	'it4em_product' => array("required" => false),
		// 	'it4em_display' => array("required" => false),
		// );

		if (isset($params->depot) && !is_array($params->depot)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "depot has to be array"))), $response);
		}
		if (isset($params->tour) && !is_array($params->tour)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "tour has to be array"))), $response);
		}
		if (isset($params->product_id) && !is_array($params->product_id)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "product_id has to be array"))), $response);
		}
		if (isset($params->type_id) && !is_array($params->type_id)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "type_idhas to be array"))), $response);
		}
		if (isset($params->source_id) && !is_array($params->source_id)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "source_id has to be array"))), $response);
		}
		if (isset($params->scountry) && !is_array($params->scountry)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "scountry has to be array"))), $response);
		}
		if (isset($params->rcountry) && !is_array($params->rcountry)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "rcountry has to be array"))), $response);
		}
		if (isset($params->it4em_product) && !is_array($params->it4em_product)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "it4em_product has to be array"))), $response);
		}

		if (!isset($params->date_from) || $params->date_from == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date from missing"))), $response);
		}

		if (!isset($params->date_to) || $params->date_to == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date to missing"))), $response);
		}

		// $results->crud = array("create" => false, "update" => false, "delete" => false);
		$results->data = $Detailed->Get($params);

		if ($results->data["Error"]) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Please refine search parameters"))), $response);
		}

		// $results->tours = $Tours->GetCashModuleTours();
		// $results->types = $Types->GetAll();
		// $results->types_it4em = $Types->GetAll_IT4EM();
		// $results->products = $Products->GetAll();
		// $results->depos = $Tours->GetDomesticDepos();
		// $results->sources = $Sources->GetAll();
		$results->sender_countries = $Countries->GetSender($params);
		$results->receiver_countries = $Countries->GetReceiver($params);
		// $results->pre_invoice = $this->pre_invoice;
		// $results->revcost = $this->revcost;
		// $results->it4em_display = $this->it4em_display;
		// $results->group_by = $this->group_by;
		// $results->b2bc = $this->b2bc;
		// $results->salespeople = $Salespeople->GetAll($params);

		$results->data["limit"] = $params->limit == 1234567890 ? ($params->query->limit == 1234567890 ? $this->limit : $params->query->limit) : $params->limit;

		return $response->withJson($results, 200);
	}

	/**
	 * Data function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Data(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Detailed = new Detailed($this->db);
		$Tours = new Tours($this->db);
		$Types = new Types($this->db);
		$Products = new Products($this->db);
		$Sources = new Sources($this->db);
		$Countries = new Countries($this->db);
		$Salespeople = new Salespeople($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$params->date_from = $params->query->date_from ?: date('Y-m-d', strtotime('first day of last year'));
		$params->date_to = $params->query->date_to ?: date('Y-m-d', strtotime('last day of this month'));

		$results = new stdClass;
		$results->validation = array(
			'date_from' => array("required" => true),
			'date_to' => array("required" => true),
			'it4em_display' => array("required" => true),
			'customerno' => array("required" => false),
			'parcelno' => array("required" => false),
			'depot' => array("required" => false),
			'tour' => array("required" => false),
			'product_id' => array("required" => false),
			'type_id' => array("required" => false),
			'source_id' => array("required" => false),
			'revcost' => array("required" => false),
			'preinvoice' => array("required" => false),
			'sales_id' => array("required" => false),
			'scountry' => array("required" => false),
			'rcountry' => array("required" => false),
			'it4em_product' => array("required" => false),
			'it4em_display' => array("required" => false),
		);

		$results->crud = array("create" => false, "update" => false, "delete" => false);

		$results->tours = $Tours->GetCashModuleTours();
		$results->types = $Types->GetAll();
		$results->types_it4em = $Types->GetAll_IT4EM();
		$results->products = $Products->GetAll();
		$results->depos = $Tours->GetDomesticDepos();
		$results->sources = $Sources->GetAll();
		$results->sender_countries = $Countries->GetSender($params);
		$results->receiver_countries = $Countries->GetReceiver($params);
		$results->pre_invoice = $this->pre_invoice;
		$results->revcost = $this->revcost;
		$results->it4em_display = $this->it4em_display;
		$results->it4em_type = $this->it4em_type;
		$results->group_by = $this->group_by;
		$results->b2bc = $this->b2bc;
		// $results->salespeople = $Salespeople->GetAll($params);

		return $response->withJson($results, 200);
	}

	/**
	 * Download function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Download(Request $request, Response $response, array $args): Response
	{

		$Language = new Language($this->db);
		$Helper = new Helper($this->db);
		$Detailed = new Detailed($this->db);
		$Tours = new Tours($this->db);
		$Types = new Types($this->db);
		$Products = new Products($this->db);
		$Sources = new Sources($this->db);
		$Countries = new Countries($this->db);
		$Salespeople = new Salespeople($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		$params->limit = 100000;
		$params->page = 1;

		if ($params->preinvoice == "yes") $params->preinvoice = 1;
		if ($params->preinvoice == "no") $params->preinvoice = 0;

		$params->group_by = (array)$params->group_by;
		$params->depot = (array)$params->depot;
		$params->tour = (array)$params->tour;
		$params->product_id = (array)$params->product_id;
		$params->type_id = (array)$params->type_id;
		$params->source_id = (array)$params->source_id;
		$params->scountry = (array)$params->scountry;
		$params->rcountry = (array)$params->rcountry;
		$params->it4em_product = (array)$params->it4em_product;
		// print_r($params);
		// exit;

		$results = new stdClass;

		if (isset($params->depot) && !is_array($params->depot)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "depot has to be array"))), $response);
		}
		if (isset($params->tour) && !is_array($params->tour)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "tour has to be array"))), $response);
		}
		if (isset($params->product_id) && !is_array($params->product_id)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "product_id has to be array"))), $response);
		}
		if (isset($params->type_id) && !is_array($params->type_id)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "type_idhas to be array"))), $response);
		}
		if (isset($params->source_id) && !is_array($params->source_id)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "source_id has to be array"))), $response);
		}
		if (isset($params->scountry) && !is_array($params->scountry)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "scountry has to be array"))), $response);
		}
		if (isset($params->rcountry) && !is_array($params->rcountry)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "rcountry has to be array"))), $response);
		}
		if (isset($params->it4em_product) && !is_array($params->it4em_product)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "it4em_product has to be array"))), $response);
		}

		if (!isset($params->date_from) || $params->date_from == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date from missing"))), $response);
		}

		if (!isset($params->date_to) || $params->date_to == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date to missing"))), $response);
		}

		if (!is_dir($this->temp_folder)) {
			mkdir($this->temp_folder, 0777, true);
		}

		$results->count = -1;

		if (!isset($params->group_by) || empty($params->group_by) || !is_array($params->group_by)) {
			$results->count = $Detailed->GetCount($params);
			// echo $results->count;
		}

		// excel row limit 1,048,576
		// povecao sam row limit na 2000000... 
		$max = 1000000;
		if ($results->count > $max) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Too much data for export\nFound " . number_format($results->count, 0, "", ".") . " parcels.\nMax " . number_format($max, 0, "", ".") . "!"))), $response);
		}

		// echo "<pre>";
		// print_r($results);
		// exit;

		if ($results->count == -1) {

			$results->data = $Detailed->Get($params);

			if ($params->group_by) {
				$header = [
					"Product",
					"Type",
					"Source",
					"Amount"
				];
				$body = [];

				foreach ($results->data["results"] as $item) {
					$body = [
						$item->product,
						$item->type,
						$item->source,
						$item->amount
					];
					$data[] = $body;
				}
			}
		} else {

			$header = [
				"Prihod/Trošak",
				"Paket",
				"Datum",
				"ID klijenta",
				"Klijent",
				"Prodavač",
				"Proizvod",
				"Tip",
				"Izvor",
				"IT4EM Proizvod",
				"IT4EM Tip proizvoda",
				"Depo",
				"Tura",
				"Iznos",
				"Predračun",
				"Poštanski broj pošiljatelja",
				"Država pošiljatelja",
				"Poštanski broj primatelja",
				"Država primatelja",
				"B2B/B2C",
				"Težina",
				"Broj"
			];
			$pages = ceil($results->count / $params->limit);

			while ($pages >= $params->page) {
				$results->data = $Detailed->Get($params);
				// echo json_encode($results);
				// print_r($results->data);
				// exit;
				foreach ($results->data["results"] as $item) {
					$body = [
						$item->revcost,
						$item->parcelno,
						$item->date,
						$item->customer_id,
						$item->customer,
						$item->salesperson,
						$item->product,
						$item->type,
						$item->source,
						$item->it4em_product,
						$item->it4em_product_type,
						$item->depot,
						$item->tour,
						$item->amount,
						$item->preinvoice,
						$item->szip,
						$item->scountry,
						$item->rzip,
						$item->rcountry,
						$item->b2bc,
						$item->weight,
						$item->count
					];
					$data[] = $body;
				}
				$params->page++;
			}
		}

		if ($results->count <= 250000) {

			foreach ($data as &$item) {
				$styleStart = $item[0] == 0
					? '<style bgcolor="#bbf7d0" border="thin#BFBFBF thin#BFBFBF thin#BFBFBF thin#BFBFBF">'
					: '<style bgcolor="#fecaca" border="thin#BFBFBF thin#BFBFBF thin#BFBFBF thin#BFBFBF">';

				$styleEnd = '</style>';

				foreach ($item as $key => $value) {
					$item[$key] = $styleStart . $value . $styleEnd;
				}
			}
			foreach ($header as &$value) {
				$value = '<b><style border="thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF">' . $value . '</style></b>';
			}

			// echo "<pre>";
			// var_dump($header);
			// var_dump($data);
			// exit;

			$file = $Helper->makeXLS($header, $data);
		} else {
			$file = $Helper->makeCSV($header, $data);
		}

		$result = new stdClass;
		$result->url = str_replace("../", "https://cpm.dpd.hr/", $this->temp_folder) . "/";
		$result->file = $file;

		return $response->withJson($result, 200);
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
		$Helper = new Helper($this->db);
		$Language = new Language($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		if (!isset($params->file) || empty($params->file)) {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "File missing"))), $response);
		}

		// if (file_exists($this->temp_folder . "/" . $params->file)) {
		// 	unlink($this->temp_folder . "/" . $params->file);
		// } else {
		// 	return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "File not found"))), $response);
		// }

		$res = new stdClass;
		$res->deleted = true;

		return $response->withJson($res, 200);
	}
}
