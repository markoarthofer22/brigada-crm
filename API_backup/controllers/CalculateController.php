<?php

namespace PP\Controller;

use PP\Classes\Activites;
use PP\Classes\Countries;
use PP\Classes\Calculate;
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
use RuntimeException;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

use Shuchkin\SimpleXLSXGen;

/**
 * CalculateController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class CalculateController extends BaseController
{

	protected $temp_folder;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct()
	{
		parent::__construct();
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

		$Helper = new Helper($this->db);
		$Language = new Language($this->db);
		$Calculate = new Calculate($this->db);
		$Types = new Types($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// $params->query->display = isset($params->query->display) ? 'cpm.b2bc' : '2';

		if (!isset($params->query->date_from) || $params->query->date_from == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date from missing"))), $response);
		}

		if (!isset($params->query->date_to) || $params->query->date_to == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date to missing"))), $response);
		}


		$results = new stdClass;
		$result = $Calculate->Get($params->query);
		$results->data = $result["data"];
		$results->total = $result["total"];
		$results->types = $Types->GetAll();
		return $response->withJson($results, 200);
	}

	/**
	 * DownloadCSV function
	 *
	 * @param [type] $Request
	 * @param Response $response
	 * @param array $args
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function DownloadCSV(Request $request, Response $response, array $args): Response
	{

		$Helper = new Helper($this->db);
		$Language = new Language($this->db);
		$Calculate = new Calculate($this->db);
		$Types = new Types($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// $params->query->display = isset($params->query->display) ? 'cpm.b2bc' : '2';

		if (!isset($params->query->date_from) || $params->query->date_from == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date from missing"))), $response);
		}

		if (!isset($params->query->date_to) || $params->query->date_to == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date to missing"))), $response);
		}


		$results = new stdClass;
		$result = $Calculate->Get($params->query);
		$results->data = $result["data"];
		$results->total = $result["total"];
		$results->types = $Types->GetAll();

		$file = "report_" . bin2hex(random_bytes(8)) . ".csv";
		$outputFile = "{$this->temp_folder}/$file";

		$output = fopen($outputFile, 'w');
		if ($output === false) {
			// Handle the error
			throw new RuntimeException("Unable to open or create the file: $outputFile");
		}

		$types = $Types->GetAll();

		$header = [
			"Customer ID",
			"Customer",
			"Sales Person",
			"Sales Channel",
			"Product",
			"Cus Type",
			"IT4EM Parcels",
			"IT4EM Weight"
		];

		foreach ($results->total["revenue"] as $key => $total) {
			$filtered = current(array_filter($types, function ($item) use ($key) {
				return $item->id === $key;
			}));
			$header[] =  $filtered->name;
		}
		foreach ($results->total["cost"] as $key => $total) {
			$filtered = current(array_filter($types, function ($item) use ($key) {
				return $item->id === $key;
			}));
			$header[] =  $filtered->name;
		}

		$header = array_merge($header, [
			"Total Revenue",
			"Total Cost",
			"Gross Margin",
			"RPP",
			"CPP",
			"WPP"
		]);

		fputcsv($output, $header);




		// echo "<pre>";
		foreach ($results->data as $item) {

			// print_r($item);
			// exit;

			$body = [
				$item["customerno"],
				$item["customer"],
				$item["rep"],
				$item["channel"],
				$item["prod"],
				$item["cusType"],
				$item["count"],
				$item["weight"],
			];

			foreach ($item["revenue"] as $key => $total) {
				$body[] =  $total;
			}
			foreach ($item["cost"] as $key => $total) {
				$body[] =  $total;
			}

			$body = array_merge($body, [
				$item["total_revenue"],
				$item["total_cost"],
				$item["gmargin"],
				$item["rpp"],
				$item["cpp"],
				$item["wpp"]
			]);

			// print_r($body);
			// exit;

			fputcsv($output, $body);
		}

		fclose($output);


		$result = new stdClass;
		// $result->filename = $outputFile;
		$result->url = str_replace("../", "https://cpm.dpd.hr/", $this->temp_folder) . "/";
		$result->file = $file;

		return $response->withJson($result, 200);
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

		$Helper = new Helper($this->db);
		$Language = new Language($this->db);
		$Calculate = new Calculate($this->db);
		$Types = new Types($this->db);

		$vars = !empty($request->getParsedBody()) ? $request->getParsedBody() : array();
		$queryParams = !empty($request->getQueryParams()) ? $request->getQueryParams() : array();
		$params = $Helper->ArrayToObject($vars);
		$params->args = $Helper->ArrayToObject($args);
		$params->query =  $Helper->ArrayToObject($queryParams);

		// $params->query->display = isset($params->query->display) ? 'cpm.b2bc' : '2';

		if (!isset($params->query->date_from) || $params->query->date_from == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date from missing"))), $response);
		}

		if (!isset($params->query->date_to) || $params->query->date_to == "") {
			return Message::WriteMessage(400, array("Message" => $Language->Translate(array("phrase" => "Date to missing"))), $response);
		}


		$results = new stdClass;
		$result = $Calculate->Get($params->query);
		$results->data = $result["data"];
		$results->total = $result["total"];
		$results->types = $Types->GetAll();

		$file = "report_" . bin2hex(random_bytes(8)) . ".xlsx";
		$outputFile = "{$this->temp_folder}/$file";

		// echo "<pre>";
		$header = [
			"<left><b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">Customer ID</style></b></left>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">Customer</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">Sales Person</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">Sales Channel</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">Product</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">Cus Type</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">IT4EM Parcels</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">IT4EM Weight</style></b>"
		];

		foreach ($results->total["revenue"] as $total) {
			$filtered = current(array_filter($results->types, function ($item) use ($total) {
				return $item->id === $total["id"];
			}));
			$header[] = "<b><style bgcolor=\"#bbf7d0\" border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">{$filtered->name}</style></b>";
		}
		foreach ($results->total["cost"] as $total) {
			$filtered = current(array_filter($results->types, function ($item) use ($total) {
				return $item->id === $total["id"];
			}));
			$header[] = "<b><style bgcolor=\"#fecaca\" border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">{$filtered->name}</style></b>";
		}

		$header = array_merge($header, [
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">Total Revenue</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">Total Cost</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">Gross Margin</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">RPP</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">CPP</style></b>",
			"<b><style border=\"thin#BFBFBF thin#BFBFBF medium#000000 thin#BFBFBF\">WPP</style></b>"
		]);

		foreach ($results->data as $item) {

			$body = [
				"<left>{$item["customerno"]}</left>",
				"{$item["customer"]}",
				"{$item["rep"]}",
				"{$item["channel"]}",
				"{$item["prod"]}",
				"{$item["cusType"]}",
				$item["count"],
				$item["weight"],
			];

			foreach ($item["revenue"] as $total) {
				$val = str_replace(".", "", $total["value"]);
				$val = str_replace(",", ".", $val);
				$body[] = "<style bgcolor=\"#bbf7d0\" border=\"thin#BFBFBF thin#BFBFBF thin#BFBFBF thin#BFBFBF\">" . $val . "</style>";
			}
			foreach ($item["cost"] as $total) {
				$val = str_replace(".", "", $total["value"]);
				$val = str_replace(",", ".", $val);
				$body[] = "<style bgcolor=\"#fecaca\" border=\"thin#BFBFBF thin#BFBFBF thin#BFBFBF thin#BFBFBF\">" . $val . "</style>";
			}

			$body = array_merge($body, [
				str_replace(",", ".", str_replace(".", "", $item["total_revenue"])),
				str_replace(",", ".", str_replace(".", "", $item["total_cost"])),
				str_replace(",", ".", str_replace(".", "", $item["gmargin"])),
				str_replace(",", ".", str_replace(".", "", $item["rpp"])),
				str_replace(",", ".", str_replace(".", "", $item["cpp"])),
				str_replace(",", ".", str_replace(".", "", $item["wpp"])),
			]);

			$data[] = $body;
		}

		// $row_count = count($results->data);

		$footer = [
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
		];

		foreach ($results->total["revenue"] as $total) {
			$val = str_replace(".", "", $total["value"]);
			$val = str_replace(",", ".", $val);
			$footer[] = "<b><style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\">" . $val . "</style></b>";
		}
		foreach ($results->total["cost"] as $total) {
			$val = str_replace(".", "", $total["value"]);
			$val = str_replace(",", ".", $val);
			$footer[] = "<b><style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\">" . $val . "</style></b>";
		}

		$footer = array_merge($footer, [
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\">" . str_replace(",", ".", str_replace(".", "", $results->total["total_revenue"])) . "</style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\">" . str_replace(",", ".", str_replace(".", "", $results->total["total_cost"])) . "</style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
			"<style bgcolor=\"#d1d5db\" border=\"medium#000000 thin#BFBFBF thin#BFBFBF thin#BFBFBF\"></style>",
		]);

		$file = $Helper->makeXLS($header, $data, $footer);

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
