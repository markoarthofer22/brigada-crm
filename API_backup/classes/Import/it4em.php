<?php

namespace PP\Classes\Import;

use PDO;
use PP\Classes\Database;
use PP\Classes\Logs;
use stdClass;

/**
 * it4em class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class it4em
{

	protected $database;
	protected $database_it4em;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		// $this->db = Database::Connection();
		$this->database = $db;
		$this->database_it4em = Database::Connection("it4em");
	}

	/**
	 * __invoke function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __invoke(object $module, string $module_name): array
	{
		$Logs = new Logs($this->database);

		$sql = "SELECT val FROM public.settings WHERE app = 'Euro conversion' AND prop = 'euro_rate'";
		$log_id = $Logs->Insert(array("module" => json_encode($module), "module_name" => $module_name, "description" => "get euro conversion from settings", "command" => $sql));
		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$euro_rate = $stmt->fetchObject()->val;
		$Logs->Update(array("id" => $log_id, "output" => $euro_rate));

		$sql = "SELECT details FROM {$_SESSION["SCHEMA"]}.settings WHERE ident = 'it4emRemoveNegativeIDs' LIMIT 1";
		$log_id = $Logs->Insert(array("module" => json_encode($module), "module_name" => $module_name, "description" => "get it4emRemoveNegativeIDs from settings", "command" => $sql));
		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$it4emRemoveNegativeIDs = $stmt->fetchObject()->details;
		$Logs->Update(array("id" => $log_id, "output" => $it4emRemoveNegativeIDs));


		$it4emRemoveNegativeIDs = (json_decode($it4emRemoveNegativeIDs, true));
		$remove_it4emRemoveNegativeIDs = '';
		if (is_array($it4emRemoveNegativeIDs) && !empty($it4emRemoveNegativeIDs)) {
			$remove_it4emRemoveNegativeIDs = 'AND i.REASON_ID NOT IN ("' . implode('","', $it4emRemoveNegativeIDs) . '");';
		}

		// $odb = oci_connect($_ENV["IT4EM_USER"], $_ENV["IT4EM_PASSWORD"], $_ENV["IT4EM_CONNSTR"], 'AL32UTF8');
		// $log_id = $Logs->Insert(array("module" => json_encode($module), "module_name" => $module_name, "description" => "connect to IT4EM", "command" => "oci_connect({$_ENV["IT4EM_USER"]}, {$_ENV["IT4EM_PASSWORD"]}, {$_ENV["IT4EM_CONNSTR"]}, 'AL32UTF8')"));
		// if (!$odb) {
		// 	$e = oci_error();
		// 	$Logs->Update(array("id" => $log_id, "output" => htmlentities($e['message'])));
		// 	trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
		// 	exit;
		// }
		// $Logs->Update(array("id" => $log_id, "output" => "connected"));

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.status_detailed SET status = 1, done = false, dstart = NOW() WHERE id = {$module->id};";
		$log_id = $Logs->Insert(array("module" => json_encode($module), "module_name" => $module_name, "description" => "update status detailed", "command" => $sql));
		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$Logs->Update(array("id" => $log_id, "output" => "success"));

		$date_start = date("Y-m-01", strtotime($module->month));
		$date_start = date("Y-m-t", strtotime($module->month));
		$date_start_it4em = date("Ym01", strtotime($module->month));
		$date_end_it4em = date("Ymt", strtotime($module->month));

		$sql = "SELECT
					shp.MASTER_PARCEL_ID,
					(CASE WHEN sp.PARCEL_ID IS NULL THEN (CASE WHEN osp.PARCEL_ID IS NULL THEN shp.MASTER_PARCEL_ID ELSE osp.PARCEL_ID END) ELSE sp.PARCEL_ID END) as PARCEL_ID,
					shp.SHP_DATE,
					shp.SHIPMENT_TYPE,
					-- i.PAYER_CUST_ID, 
					shp.PAYER_CUST_ID,
					gp.PROD_ID, 
					gp.PROD_NAME, 
					gp.PROD_TYPE,
					i.INVOICE_DOC_NUMBER,
					i.INVOICE_DATE,
					(id.AMOUNT_LOCAL+id.DISC_AMOUNT_LOCAL)/(CASE WHEN osp.PARCEL_ID IS NULL THEN (CASE WHEN shp.PIECE_NUMBER < 1 THEN 1 ELSE shp.PIECE_NUMBER END) ELSE 1 END) as AMOUNT_LOCAL_INCL_DISCOUNTS,
					(id.AMOUNT_LOCAL+id.DISC_AMOUNT_LOCAL)/(CASE WHEN osp.PARCEL_ID IS NULL THEN (CASE WHEN shp.PIECE_NUMBER < 1 THEN 1 ELSE shp.PIECE_NUMBER END) ELSE 1 END) * osp.VAT_RATIO * osp.APPLY_VAT/100 as VAT_INCL_DISCOUNTS,
					osp.LOCAL_PRICE_CUR_ID as CURRENCY,
					shp.SENDER_ZIP_CODE,
					sc.CODE_NUMERIC as SENDER_COUNTRY,
					shp.RECEIVER_ZIP_CODE,
					CASE WHEN rc.CODE_NUMERIC IS NULL THEN '999' ELSE rc.CODE_NUMERIC END as RECEIVER_COUNTRY,
					(CASE WHEN sp.kg IS NULL THEN shp.total_kg ELSE sp.kg END) as WEIGHT,
					COALESCE(CASE WHEN FLOOR(id.AMOUNT/NULLIF(id.UNIT_PRICE, 0)) < 0 OR gp.PROD_TYPE != 0 THEN 0 ELSE FLOOR(id.AMOUNT/NULLIF(id.UNIT_PRICE, 0)) END, 0) as COUNT,
					c1.TAX_NUMBER,
					shp.PAYER_CUST_ID as SPAYER, shp.SENDER_CUST_ID as SSENDER, shp.RECEIVER_CUST_ID as SRECEIVER
				FROM KOPDEV.INV_INVOICE i
				JOIN KOPDEV.INV_INVOICE_DET id ON id.INVOICE_NUMBER = i.INVOICE_NUMBER
				JOIN KOPDEV.OPR_SHP_PRODUCTS osp ON osp.SHP_PROD_ID = id.SHP_PROD_ID
				JOIN KOPDEV.OPR_SHIPMENT shp ON shp.SHP_ID = osp.SHP_ID
				LEFT JOIN KOPDEV.OPR_SHP_PARCEL sp ON sp.SHP_ID = shp.SHP_ID AND osp.PARCEL_ID IS NULL
				JOIN KOPDEV.GEN_PROD gp ON gp.PROD_ID = osp.PROD_ID
				JOIN KOPDEV.GEN_COUNTRY sc ON sc.COUNTRY_ID = shp.SENDER_COUNTRY_ID
				JOIN KOPDEV.GEN_COUNTRY rc ON rc.COUNTRY_ID = shp.RECEIVER_COUNTRY_ID
				LEFT JOIN KOPDEV.GEN_CUSTOMER c1 ON c1.CUST_ID = shp.PAYER_CUST_ID
				WHERE 
					shp.ACTIVE_FLAG = 1 
					AND shp.STATUS = 1 
					AND osp.ACTIVE_FLAG = 1
					AND osp.STATUS = 1
					AND (id.AMOUNT_LOCAL + id.DISC_AMOUNT_LOCAL) != 0
					AND i.TEST_FLAG = 0 
					{$remove_it4emRemoveNegativeIDs}
					AND i.INVOICE_DATE BETWEEN {$date_start_it4em} AND {$date_end_it4em}
				ORDER BY shp.MASTER_PARCEL_ID DESC
		";
		$log_id = $Logs->Insert(array("module" => json_encode($module), "module_name" => $module_name, "description" => "main IT4EM query", "command" => $sql));
		$stmt = $this->database_it4em->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);
		$Logs->Update(array("id" => $log_id, "output" => "success"));

		return array("msg" => $it4emRemoveNegativeIDs, "data" => $results);
	}
}
