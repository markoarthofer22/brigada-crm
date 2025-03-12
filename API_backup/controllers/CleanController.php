<?php

namespace PP\Controller;

use Exception;
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

/**
 * CleanController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class CleanController extends BaseController
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
		$deletedFiles = $this->CleanTempFolder();
		return $response->withJson(["deleted_files" => $deletedFiles], 200);
	}

	private function CleanTempFolder()
	{
		$deletedFiles = 0;
		$now = time();
		$timespan = 1; // Time span in hours

		if (!is_dir($this->temp_folder)) {
			throw new RuntimeException("The folder {$this->temp_folder} does not exist.");
		}

		$files = scandir($this->temp_folder);
		if ($files === false) {
			throw new RuntimeException("Failed to read the folder {$this->temp_folder}.");
		}

		foreach ($files as $file) {
			if ($file === '.' || $file === '..') {
				continue;
			}

			$filePath = "{$this->temp_folder}/{$file}";
			if (is_file($filePath)) {
				$fileModifiedTime = filemtime($filePath);

				if ($fileModifiedTime !== false && ($now - $fileModifiedTime) > ($timespan * 3600)) {
					if (unlink($filePath)) {
						$deletedFiles++;
					} else {
						throw new RuntimeException("Failed to delete file: $filePath");
					}
				}
			}
		}

		return $deletedFiles;
	}
}
