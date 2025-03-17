<?php

namespace PP\Controller;

use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Questions;
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
		$Questions = new Questions($this->db);

		$settings = new stdClass;
		$settings->user = $_SESSION["user"];
		// $settings->session_id =  $_SESSION["session_id"];
		$settings->lang = $_SESSION["lang"];
		$settings->questions_types = $Questions->GetTypes();

		// print_r($_SESSION);

		return $response->withJson($settings, 200);
	}
}
