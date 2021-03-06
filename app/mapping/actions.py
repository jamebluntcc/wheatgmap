# -*- coding: utf-8 -*-
import os
from app.auth.models import Data
from settings import Config, basedir
from app.utils import processor, parseInput
from app.app import celery
from flask_login import current_user
import json

UPLOAD_PATH = os.path.join(basedir, 'app', 'static', 'download')
MAPPING_PATH = os.path.join(UPLOAD_PATH, 'gene_mapping')
ANN_PATH = os.path.join(UPLOAD_PATH, 'vcf_ann')
gene_bed_file = '/data/data/wheat/reference/gene.5kbupdown.window.bed'
#VCF_TABLE_PATH = '/home/app/wheatDB/data/vcf_private_table'
#SNP_SCORE_SCRIPT = '/home/scripts/omSnpScore/scripts/snpScore'

def fetch_vcf():
    pub_vcf = Data.query.filter_by(opened=1, sign=0).all()
    own_vcf = []
    if current_user.is_authenticated:
        own_vcf = Data.query.filter_by(provider=current_user.username, opened=0, sign=0).all()
    else:
        own_vcf = []
    
    tc_series = ['.'.join([each.tc_id, each.sample_name]) for each in pub_vcf] + ['.'.join([each.tc_id, each.sample_name]) for each in own_vcf]
    print(tc_series)
    return tc_series

@celery.task
def run_bsa(info):
    freq_pattern = 'snp.freq.plot.jpg'
    score_pattern = 'var.score.plot.jpg'
    print(info)
    cmd = "snpScore -p '{info}' -d {vcf_dir} -o {out_dir} --vcf_ann_file /data/wheatdb/data/vcf_private/snp.ann.table.pkl".format(
        info=info,
        vcf_dir=Config.VCF_TABLE_PATH,
        out_dir=MAPPING_PATH
    )

    # test
    print(cmd)
 
    result = processor.shRun(cmd)
    result_base = result[0]
    result_path = os.path.join(result_base, 'results')
    print(result_path)
    processor.Run(cmd="cd {dir} && zip -r {zip_file} results".format(
        zip_file=os.path.join(result_base, 'results.zip'),
        dir=result_base
    ))
    print("cd {dir} && zip -r {zip_file} results".format(
        zip_file=os.path.join(result_base, 'results.zip'),
        dir=result_base
    ))
    all_files = os.listdir(result_path)
    path = result_path.split('/home/app/vcfweb/wheatdb/app')[-1]
    freq_files = [os.path.join(path, file) for file in all_files if file[-len(freq_pattern):] == freq_pattern]
    score_files = [os.path.join(path, file) for file in all_files if file[-len(score_pattern):] == score_pattern]
    return {'task': 'bsa', 'result': {'path': os.path.join(path, '../results.zip'), 'files': freq_files + score_files}}


@celery.task
def compare_info(info):
    genes = info.get('gene_id')
    if genes:
        gene_list = parseInput(genes)
        if len(gene_list) == 0:
            return {'task': 'compare_info', 'result': {'header':[], 'body':[]}}
        info['gene_id'] = gene_list

    cmd = "snpInf \
            --gene_bed {gene_bed} \
            --vcf_ann_file /data/wheatdb/data/vcf_private/snp.ann.table.pkl \
            --vcf_dir {vcf_table} \
            --outdir {outdir} \
            --parameters '{param}'".format(
            gene_bed=gene_bed_file,
            vcf_table=Config.VCF_TABLE_PATH,
            param=json.dumps(info),
            outdir=ANN_PATH,
            )
    #print(cmd)
    result = processor.shRun(cmd)
    if result:
        head_data = result[0].split('\t')
        body_data = [row.split('\t') for row in result[1:]]
        return {'task': 'compare_info', 'result': {'header': head_data, 'body': body_data}}
    return {'task': 'compare_info', 'result': {'header':[], 'body':[]}}

