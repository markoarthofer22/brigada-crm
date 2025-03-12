<?php

namespace PP\Classes;

use Shuchkin\SimpleXLSXGen;
use stdClass;
use PDO;

/**
 * Helper class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Helper
{

	protected $db;
	protected $database;
	protected $temp_folder;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		// $this->db = Database::Connection();
		$this->database = $db;
		$this->temp_folder = "../files/temp";
	}

	/**
	 * ArrayToObject function
	 *
	 * @param array $array
	 * @return object
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function ArrayToObject(array $array): object
	{
		$obj = new stdClass;

		foreach ($array as $key => $value) {
			if (strlen($key)) {
				if (is_array($value) && $key !== "values" && $key !== "available_values") {
					$obj->{$key} = $this->ArrayToObject($value);
				} else {
					$obj->{$key} = $value;
				}
			}
		}
		return $obj;
	}

	/**
	 * GUID function
	 *
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GUID(): string
	{
		return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', \mt_rand(0, 65535), \mt_rand(0, 65535), \mt_rand(0, 65535), \mt_rand(16384, 20479), \mt_rand(32768, 49151), \mt_rand(0, 65535), \mt_rand(0, 65535), \mt_rand(0, 65535));;
	}

	/**
	 * Filesize function
	 *
	 * @param integer $bytes
	 * @param integer $decimals
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Filesize(int $bytes, int $decimals = 2): string
	{
		$factor = floor((strlen($bytes) - 1) / 3);
		if ($factor > 0) {
			$sz = 'KMGT';
		}
		return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$sz[$factor - 1] . 'B';
	}

	/**
	 * Converts a given column number to its corresponding Excel column name.
	 *
	 * @param integer $columnNumber The column number (starting from 1).
	 * @return string The corresponding Excel column name (e.g., 1 -> A, 27 -> AA).
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function getExcelColumnName($columnNumber)
	{
		$columnName = '';
		while ($columnNumber > 0) {
			$modulo = ($columnNumber - 1) % 26;
			$columnName = chr(65 + $modulo) . $columnName;
			$columnNumber = intval(($columnNumber - $modulo) / 26);
		}
		return $columnName;
	}

	/**
	 * Generates a CSV file with the given header and body.
	 *
	 * @param array $header An array containing the column headers.
	 * @param array $body A multidimensional array containing the CSV rows.
	 * @return string The filename of the generated CSV file.
	 * @throws \RuntimeException If the file cannot be created or opened.
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function makeCSV($header, $body)
	{
		$file = "report_" . bin2hex(random_bytes(8)) . ".csv";
		$outputFile = "{$this->temp_folder}/$file";
		$output = fopen($outputFile, 'w');
		if ($output === false) {
			// Handle the error
			throw new \RuntimeException("Unable to open or create the file: $outputFile");
		}
		fputcsv($output, $header);
		foreach ($body as $item) {
			fputcsv($output, $item);
		}
		fclose($output);
		return $file;
	}

	/**
	 * Generates an XLSX file with the given header and body.
	 *
	 * @param array $header An array containing the column headers.
	 * @param array $body A multidimensional array containing the XLSX rows.
	 * @param array $footer An array containing the footer.
	 * @return string The filename of the generated XLSX file.
	 * @throws \RuntimeException If the file cannot be created or opened.
	 * @throws \SimpleXLSXGenException If the XLSX file cannot be generated.
	 * @throws \Exception If the random bytes cannot be generated.
	 */
	public function makeXLS($header, $body, $footer = array())
	{
		$file = "report_" . bin2hex(random_bytes(8)) . ".xlsx";
		$outputFile = "{$this->temp_folder}/$file";

		$rows = array_merge([$header], $body, [$footer]);

		$xlsx = SimpleXLSXGen::fromArray($rows);
		$lastCol = self::getExcelColumnName(count($header));
		$xlsx->autoFilter("A1:{$lastCol}1");
		$xlsx->saveAs($outputFile);

		return $file;
	}







	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public function parseRegex($format)
	{
		$len = 0;
		$type = '';
		$maxlen = intval(strlen($format));
		$pattern = '';
		for ($i = 0; $i < $maxlen; $i++) {
			if ($type == '') {
				$type = $format[$i];
				$len = 1;
			} else if ($type != $format[$i]) {
				if ($type == 'N')
					$pattern .= '[0-9]{' . $len . '}';
				else
					$pattern .= '[A-Za-z]{' . $len . '}';
				$len = 1;
				$type = $format[$i];
			} else if ($i == ($maxlen - 1)) {
				$len++;
				if ($type == 'N')
					$pattern .= '[0-9]{' . $len . '}';
				else
					$pattern .= '[A-Za-z]{' . $len . '}';
			} else {
				$len++;
			}
		}
		return $pattern;
	}

	public function in_range($number, $min, $max, $inclusive = false)
	{
		if (is_int($number) && is_int($min) && is_int($max)) {
			return $inclusive
				? ($number >= $min && $number <= $max)
				: ($number > $min && $number < $max);
		}
		return false;
	}

	public function getFromSettings($field, $where)
	{
		$sql = "SELECT {$field} FROM price_calculator.settings WHERE prop = '{$where}'";
		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$r = $stmt->fetchObject();

		return $r;
	}

	public function getTotal($array)
	{
		$total = 0.0;
		foreach ($array as $index => $value) {
			$total += floatval($value);
		}
		return $total;
	}

	public function saveCalc($params)
	{
		$_SESSION['calc']['total'] = $params->total;
		$_SESSION['calc']['fuel'] = $params->fuel;
		$_SESSION['calc']['geo'] = $params->geo;
		$_SESSION['calc']['pdv'] = $params->pdv;
		$_SESSION['calc']['car'] = $params->car;
		$_SESSION['calc']['service'] = $params->service;
		$_SESSION['calc']['country'] = $params->country;
		$_SESSION['calc']['pipost'] = $params->pipost;
		$_SESSION['calc']['depost'] = $params->depost;
		$_SESSION['calc']['count'] = $params->count;
		$_SESSION['calc']['island'] = $params->island;
		$_SESSION['calc']['weight'] = $params->totalweight;
		$_SESSION['calc']['nopdv'] = $params->nopdv;
		$_SESSION['calc']['express'] = $params->expressval;
		$_SESSION['calc']['add'] = $params->add;
		$_SESSION['calc']['addval'] = $params->addval;
		$_SESSION['calc']['addprice'] = $params->addprice;
		$_SESSION['calc']['dinv'] = $params->dinv;
		$_SESSION['calc']['product'] = $params->product;
		$_SESSION['calc']['incot'] = strtoupper($params->incot);
		$_SESSION['calc']['codfee'] = $params->codfee;
		$_SESSION['calc']['time'] = time();
	}

	public function get_client_ip()
	{
		$ipaddress = '';
		if (isset($_SERVER)) {
			if (isset($_SERVER['HTTP_CLIENT_IP']))
				$ipaddress = $_SERVER['HTTP_CLIENT_IP'];
			elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR']))
				$ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
			elseif (isset($_SERVER['HTTP_X_FORWARDED']))
				$ipaddress = $_SERVER['HTTP_X_FORWARDED'];
			elseif (isset($_SERVER['HTTP_FORWARDED_FOR']))
				$ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
			elseif (isset($_SERVER['HTTP_FORWARDED']))
				$ipaddress = $_SERVER['HTTP_FORWARDED'];
			elseif (isset($_SERVER['REMOTE_ADDR']))
				$ipaddress = $_SERVER['REMOTE_ADDR'];
		}
		if (empty($ipaddress)) {
			if (getenv('HTTP_CLIENT_IP'))
				$ipaddress = getenv('HTTP_CLIENT_IP');
			elseif (getenv('HTTP_X_FORWARDED_FOR'))
				$ipaddress = getenv('HTTP_X_FORWARDED_FOR');
			elseif (getenv('HTTP_X_FORWARDED'))
				$ipaddress = getenv('HTTP_X_FORWARDED');
			elseif (getenv('HTTP_FORWARDED_FOR'))
				$ipaddress = getenv('HTTP_FORWARDED_FOR');
			elseif (getenv('HTTP_FORWARDED'))
				$ipaddress = getenv('HTTP_FORWARDED');
			elseif (getenv('REMOTE_ADDR'))
				$ipaddress = getenv('REMOTE_ADDR');
			else
				$ipaddress = 'UNKNOWN';
		}
		return $ipaddress;
	}

	public function calcSignature($cartid, $amount)
	{
		$data = $_ENV["WSPAY_SHOPID"] . $_ENV["WSPAY_SECRET"] . $cartid . $_ENV["WSPAY_SECRET"] . str_replace('.', '', number_format(str_replace(',', '.', $amount), 2, '.', '')) . $_ENV["WSPAY_SECRET"];
		return hash('md5', $data);
	}

	public function validateSignature($params)
	{
		$signature = $params->Signature;
		$check = $_ENV["WSPAY_SHOPID"] . $_ENV["WSPAY_SECRET"] . $params->ShoppingCartID . $_ENV["WSPAY_SECRET"] . $params->Success . $_ENV["WSPAY_SECRET"] . $params->ApprovalCode . $_ENV["WSPAY_SECRET"];
		return hash_equals($signature, hash('md5', $check));
	}

	public function isJson($string)
	{
		json_decode($string);
		return json_last_error() === JSON_ERROR_NONE;
	}

	public function calculatePercentageDifference($current, $previous): float
	{
		if ($previous == 0) {
			return 0; // Avoid division by zero
		}
		return (($current - $previous) / abs($previous)) * 100;
	}

	public function formatBytes($bytes, $precision = 2)
	{
		$units = ['B', 'KB', 'MB', 'GB', 'TB'];

		$bytes = max($bytes, 0);
		$pow = floor(($bytes ? log($bytes) : 0) / log(1024));
		$pow = min($pow, count($units) - 1);

		// Calculate the bytes for the given unit
		$bytes /= pow(1024, $pow);

		return round($bytes, $precision) . ' ' . $units[$pow];
	}
}
