<?php

namespace PP\Controller;

use Exception;
use PP\Classes\Helper;
use PP\Classes\Import\_import;
use PP\Classes\Import\it4em;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Logs;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * ImportController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class ImportController extends BaseController
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
		$Logs = new Logs($this->db);
		$Import = new _import($this->db);
		$it4em = new it4em($this->db);
		$translations = !empty($Language->PrepareWords()) ? $Language->PrepareWords() : new stdClass;

		$results = new stdClass;
		$results->modules = $Import->GetModules();
		$results->next_module = $Import->GetNextModule();

		if (!$results->next_module) {
			exit;
		}

		$matching_modules = array_filter(
			$results->modules,
			fn($module) => $module->id == $results->next_module->smodule_id
		);
		$module_name = count($matching_modules) > 0 ? reset($matching_modules)->name : '';

		$result = new stdClass;
		try {
			$result = ${$module_name}($results->next_module, $module_name);
		} catch (Exception $e) {
			// Handle exception
			throw $e;
		}


		// print_r($result);
		// exit;

		return $response->withJson($result, 200);
	}
}
