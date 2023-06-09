<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="看病日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="是否有病" prop="sick">
        <el-select
          v-model="queryParams.sick"
          placeholder="是否有病"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in booleanOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="疾病标签" prop="tags">
        <el-select
          v-model="queryParams.tags"
          placeholder="疾病标签"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in hisTagOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="看病类型" prop="treatType">
        <el-select
          v-model="queryParams.treatType"
          placeholder="看病类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in treatTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatRecord:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['health:treat:treatRecord:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          :disabled="single"
          @click="handleCreateAsTemplate"
          v-hasPermi="['health:treat:treatRecord:create']"
        >以此为模板</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['health:treat:treatRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:treat:treatRecord:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['health:treat:treatRecord:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-document"
          size="mini"
          :disabled="single"
          @click="handleLifeArchives"
          v-hasPermi="['life:lifeArchives:create']"
        >同步档案</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleStat"
          v-hasPermi="['health:treat:treatRecord:stat']"
        >概要统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="planStat"
          v-hasPermi="['report:plan:userPlan:commonStat']"
        >计划统计</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="treatRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.treatTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病症状" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.disease }}</span>
          <span class="link-type" @click="showBodyAbnormalRecordAnalyse(row.disease,'DISEASE')"><i class="el-icon-s-promotion" /></span>
        </template>
      </el-table-column>
      <el-table-column label="医院"  min-width="180" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.hospital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="药品" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDrugList(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <el-table-column label="手术" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleOperationList(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <el-table-column label="科室" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.department }}</span>
        </template>
      </el-table-column>
      <el-table-column label="器官">
        <template slot-scope="{row}">
          <span>{{ row.organ }}</span>
          <span class="link-type" @click="showBodyAbnormalRecordAnalyse(row.organ,'ORGAN')"><i class="el-icon-s-promotion" /></span>
        </template>
      </el-table-column>
      <el-table-column label="确诊疾病"  min-width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.diagnosedDisease }}</span>
          <span class="link-type" @click="showBodyAbnormalRecordAnalyse(row.diagnosedDisease,'DISEASE')"><i class="el-icon-s-promotion" /></span>
        </template>
      </el-table-column>
      <el-table-column label="是否有病" align="center" width="100">
        <template slot-scope="{row}">
          <span v-if="row.isSick==true" style="color: red;">
           是
          </span>
          <span v-else style="color: green;">
           否
          </span>
        </template>
      </el-table-column>
      <el-table-column label="看病日期" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.treatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="费用" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.totalFee) }}</span>
          <span class="link-type" @click="showFeeDetail(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <!--
      <el-table-column label="疼痛级别" align="center" width="140">
        <template slot-scope="{row}">
          <el-rate v-model="row.painLevel" disabled show-text></el-rate>
        </template>
      </el-table-column>
      <el-table-column label="重要等级" align="center" width="140">
        <template slot-scope="{row}">
          <el-rate v-model="row.importantLevel" disabled show-text></el-rate>
        </template>
      </el-table-column>
      -->
      <el-table-column label="门诊类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.osName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医生" align="center">
        <template slot-scope="{row}">
          <span>{{ row.doctor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['health:treat:treatRecord:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treatRecord:delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 表单页面 -->
    <el-dialog :title="title" width="780px" :visible.sync="open" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="医院名称" prop="hospital">
                <el-select
                  v-model="form.hospital"
                  :style="{width: '100%'}"
                  filterable
                  allow-create
                  default-first-option>
                  <el-option
                    v-for="dict in hospitalOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="科室名称" prop="department">
                <el-select
                  v-model="form.department"
                  :style="{width: '100%'}"
                  filterable
                  allow-create
                  default-first-option>
                  <el-option
                    v-for="dict in departmentOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="疾病症状" prop="disease">
                <el-select
                  v-model="form.disease"
                  :style="{width: '100%'}"
                  filterable
                  allow-create
                  default-first-option>
                  <el-option
                    v-for="dict in diseaseOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属器官" prop="organ">
                <el-select
                  v-model="form.organ"
                  :style="{width: '100%'}"
                  filterable
                  allow-create
                  default-first-option>
                  <el-option
                    v-for="dict in organOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="确诊疾病" prop="diagnosedDisease">
                <el-select
                  v-model="form.diagnosedDisease"
                  :style="{width: '100%'}"
                  filterable
                  allow-create
                  default-first-option>
                  <el-option
                    v-for="dict in diagnosedDiseaseOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="看病类型" prop="treatType">
                <el-select
                  v-model="form.treatType"
                  :style="{width: '100%'}"
                  default-first-option
                  placeholder="请选择">
                  <el-option
                    v-for="dict in treatTypeOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="疾病标签" prop="tags">
                <el-tag
                  :key="tag"
                  v-for="tag in tagsOptions"
                  closable
                  :disable-transitions="false"
                  @close="handleTagClose(tag)">
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleTagInputConfirm"
                  @blur="handleTagInputConfirm"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showTagInput">+ 新建</el-button>
                <el-select
                v-model="chooseTag"
                clearable
                placeholder="请选择"
                @change="selectTag">
                  <el-option
                    v-for="dict in hisTagOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="疼痛等级" prop="painLevel">
               <el-rate
                 v-model="form.painLevel"
                 show-score
                 :max="5"
                 text-color="#ff9900"
                 score-template="{value}">
               </el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="重要程度" prop="importantLevel">
               <el-rate
                 v-model="form.importantLevel"
                 show-score
                 allow-half
                 text-color="#ff9900"
                 score-template="{value}">
               </el-rate>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="门诊类型" prop="osName">
                <el-select
                  v-model="form.osName"
                  :style="{width: '100%'}"
                  allow-create
                  clearable
                  default-first-option
                  placeholder="请选择">
                  <el-option
                    v-for="dict in osNameOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="医生姓名" prop="doctor">
                <el-input v-model="form.doctor" :style="{width: '100%'}" placeholder="" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="看病时间" prop="treatDate">
                <el-date-picker type="datetime" v-model="form.treatDate" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                          :style="{width: '100%'}" placeholder="请选择时间" clearable >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="是否有病" prop="isSick">
                <el-switch v-model="form.isSick"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="费用信息">
                <span class="link-type" @click="showFee()"><i class="el-icon-setting" /></span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注信息">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="submitForm">保 存</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>

    <!-- 药品列表页面 -->
    <el-dialog :title="drugListTitle" width="900px" :visible.sync="drugListOpen"  append-to-body>
      <drug-list
        :treatRecordData="treatRecordData"
      />
    </el-dialog>

    <!-- 手术列表页面 -->
    <el-dialog :title="operationListTitle" width="900px" :visible.sync="operationListOpen"  append-to-body>
      <operation-list
        :treatRecordData="treatRecordData"
      />
    </el-dialog>

    <!-- 人生档案详情页面 -->
      <el-dialog :title="ladTitle" width="650px" :visible.sync="ladOpen"  append-to-body>
        <life-archives-detail :lifeArchivesData="lifeArchivesData" @closeMe="closeLad"/>
      </el-dialog>

    <!-- 概要统计 -->
    <el-dialog title="概要统计" width="1100px" :visible.sync="statOpen">
      <stat/>
    </el-dialog>

    <!-- 费用信息 -->
    <el-dialog title="费用信息" width="700px" :visible.sync="feeOpen">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-card>
          <div slot="header" align="center"><span>分项费用明细(原始费用)</span></div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="药品费用" prop="drugFee">
              <el-input-number v-model="form.drugFee" @change="calTotalFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly"/>
              元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手术/治疗费用" prop="operationFee">
              <el-input-number v-model="form.operationFee" @change="calTotalFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly"/>
              元
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="挂号费用" prop="registeredFee">
              <el-input-number v-model="form.registeredFee" @change="calTotalFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly"/>
              元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="其他费用" prop="otherFee">
              <el-input-number v-model="form.otherFee" @change="calTotalFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" disabled/>
              元
            </el-form-item>
          </el-col>
        </el-row>
        </el-card>
        </br>
        <el-card>
          <div slot="header" align="center"><span>支付详情(统计)</span></div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="总共花费" prop="totalFee">
              <el-input-number v-model="form.totalFee" @change="calMIPFee"  :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly"/>
              元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="个人支付" prop="personalPaidFee">
              <el-input-number v-model="form.personalPaidFee" @change="calMIPFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly"/>
              元
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="医保花费" prop="medicalInsurancePaidFee">
              <el-input-number v-model="form.medicalInsurancePaidFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly"/>
              元
            </el-form-item>
          </el-col>
        </el-row>
        </el-card>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="closeFee">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,deleteTreatRecord,getTreatRecordTagsTree,getTreatCategoryTree,getTreatRecord,createTreatRecord,
    updateTreatRecord} from "@/api/health/treat/treatRecord";
import {dispatchCommonStat} from "@/utils/planUtils";
import DrugList from "../treatDrug/index";
import OperationList from "../treatOperation/index";
import {copyObject,getQueryObject} from "@/utils/index";
import {getNowDateTimeString} from "@/utils/datetime";
import LifeArchivesDetail from '../../../life/lifeArchives/detail'
import Stat from './stat'

export default {
  name: "TreatRecord",
  components: {
    'drug-list':DrugList,
    'operation-list':OperationList,
    'life-archives-detail':LifeArchivesDetail,
    'stat':Stat
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //同步档案属性 start
      ladTitle:'',
      ladOpen:false,
      lifeArchivesData:{},
      //同步档案属性 end
      //药品列表
      drugListTitle:'',
      drugListOpen:false,
      treatRecordData:{
        id:undefined
      },
      //手术列表
      operationListTitle:'',
      operationListOpen:false,
      //金额统计
      statOpen:false,
      //表单页面修改
      feeOpen:false,
      title:'',
      open:false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 列表数据
      treatRecordList:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined
      },
      booleanOptions:this.booleanOptions,
      //疾病标签(表单页面的新增、编辑使用)
      tagsOptions:[],
      //看病类型
      treatTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      //医院列表
      hospitalOptions:[],
      departmentOptions:[],
      diseaseOptions:[],
      organOptions:[],
      diagnosedDiseaseOptions:[],
      treatTypeOptions:[],
      osNameOptions:[],
      loading:false,
      //历史标签（查询或者选择使用）
      hisTagOptions:[],
      inputVisible: false,
      inputValue: '',
      chooseTag:undefined,
      // 表单参数
      form: {},
      //费用是否只读
      feeReadOnly:false,
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        hospital: [
          { required: true, message: "医院不能为空", trigger: "blur" }
        ],
        department: [
          { required: true, message: "科室不能为空", trigger: "blur" }
        ],
        disease: [
          { required: true, message: "疾病症状不能为空", trigger: "blur" }
        ],
        organ: [
          { required: true, message: "器官不能为空", trigger: "blur" }
        ],
        diagnosedDisease: [
          { required: true, message: "确诊疾病不能为空", trigger: "blur" }
        ],
        treatDate: [
          { required: true, message: "看病时间不能为空", trigger: "blur" }
        ],
        osName: [
          { required: true, message: "门诊类型不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleUrlQuery();
    this.getList();
    this.getTreatRecordTagsTreeselect();
    this.getEnumTree('TreatType','FIELD',false).then(response => {
      this.treatTypeOptions = response;
    });
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
      }
    },
    /** 费用信息 */
    showFee(){
      this.feeOpen=true;
      this.feeReadOnly = false;
    },
    closeFee(){
      this.feeOpen=false;
    },
    /** 计算医保费用 */
    calMIPFee(){
      this.form.medicalInsurancePaidFee=this.form.totalFee-this.form.personalPaidFee;
    },
    /** 计算总费用 */
    calTotalFee(){
      this.form.totalFee=this.form.drugFee+this.form.operationFee+this.form.registeredFee;
    },
    /** 显示费用详情 */
    showFeeDetail(row){
      this.feeOpen=true;
      this.form = row;
      this.feeReadOnly = true;
    },
    /** 同步档案 */
    handleLifeArchives(){
      const id = this.ids.join(",")
      getTreatRecord(id).then(response => {
        this.ladTitle='同步档案';
        this.ladOpen=true;
        this.lifeArchivesData={
          id:undefined,
          title:'看病信息',
          content:'生病:'+response.diagnosedDisease,
          date:response.treatDate,
          bussType:'TREAT_RECORD',
          relatedBeans:'TreatRecord',
          sourceId:response.id,
          remark:undefined
        };
      });
    },
    /** 关闭同步档案 */
    closeLad(){
      this.ladOpen=false;
    },
    /** 概要统计 */
    handleStat(){
      this.statOpen=true;
    },
    /** URL查询 */
    handleUrlQuery(){
      let qb = getQueryObject(null);
      const id = qb.id;
      if(!this.isObjectEmpty(id)){
        //打开详情页
        let row={
          id:id
        };
        this.handleUpdate(row);
      }
    },
    /** 药品列表 */
    handleDrugList(row){
      this.drugListTitle = 'ID:'+row.id+'['+row.disease+']药品列表';
      this.drugListOpen =true;
      this.treatRecordData = Object.assign({}, this.treatRecordData, {
        id: row.id
      });
    },
    /** 手术列表 */
    handleOperationList(row){
      this.operationListTitle = 'ID:'+row.id+'['+row.disease+']手术列表';
      this.operationListOpen =true;
      this.treatRecordData = Object.assign({}, this.treatRecordData, {
        id: row.id
      });
    },
    /** 标签处理 */
    handleTagClose(tag) {
      this.tagsOptions.splice(this.tagsOptions.indexOf(tag), 1);
    },
    handleTagAppend(tag) {
      this.appendTagToOptions(tag,this.tagsOptions);
    },
    showTagInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleTagInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.appendTagToOptions(inputValue,this.tagsOptions);
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    /** 添加标签，避免重复 */
    appendTagToOptions(tag,options){
      if(this.isObjectEmpty(tag)){
        return;
      }
      const a = options.indexOf(tag);
      if(a>=0){
        this.msgError('该标签已经存在')
      }else{
        options.push(tag);
      }
    },
    //下拉框选择历史标签
    selectTag(val){
      this.appendTagToOptions(val,this.tagsOptions);
    },
    /** 初始化下拉树结构 */
    initOptionList(){
      getTreatCategoryTree('hospital',false).then(response => {
        this.hospitalOptions = response;
      });
      getTreatCategoryTree('department',false).then(response => {
        this.departmentOptions = response;
      });
      getTreatCategoryTree('disease',false).then(response => {
        this.diseaseOptions = response;
      });
      getTreatCategoryTree('organ',false).then(response => {
        this.organOptions = response;
      });
      getTreatCategoryTree('diagnosedDisease',false).then(response => {
        this.diagnosedDiseaseOptions = response;
      });
      this.getDictItemTree('TREAT_OS_NAME',false).then(response => {
        this.osNameOptions = response;
      });
    },
    /** 查询下拉树结构 */
    getOptionTreeselect(groupField,optionList) {
      getTreatCategoryTree(groupField,false).then(response => {
        optionList = response;
      });
    },
    /** 查询标签下拉树结构 */
    getTreatRecordTagsTreeselect() {
      getTreatRecordTagsTree(false).then(response => {
        this.hisTagOptions = response;
      });
    },
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('TreatRecord',this.$router);
    },
    /** 身体不适分析 */
    showBodyAbnormalRecordAnalyse(name,groupField){
      //路由定向
      this.$router.push({name:'BodyAbnormalRecordAnalyse',query: {name:name,groupField:groupField}})
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.treatRecordList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleCreate() {
      this.reset();
      this.initOptionList();
      this.open = true;
      this.title = "添加";
      this.tagsOptions = [];
    },
    /** 以模板新增按钮操作 */
    handleCreateAsTemplate() {
      this.reset();
      const id = this.ids.join(",")
      getTreatRecord(id).then(response => {
        this.form = response;
        this.form.id=undefined;
        this.form.treatDate=getNowDateTimeString();
        if(!this.isObjectEmpty(response.tags)){
          this.tagsOptions = response.tags.split(',');
        }else{
          this.tagsOptions = [];
        }
        this.open = true;
        this.title = "新增";
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.initOptionList();
      this.open = true;
      this.title = "修改";
      const id = row.id || this.ids.join(",")
      //加载详情
      getTreatRecord(id).then(response => {
        this.form = response;
        if(!this.isObjectEmpty(response.tags)){
          this.tagsOptions = response.tags.split(',');
        }else{
          this.tagsOptions = [];
        }
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        isSick: true,
        painLevel: 3,
        importantLevel: 3,
        treatType: 'TREAT',
        osName:'普通',
        drugFee:0,
        operationFee:0,
        personalPaidFee:0,
        medicalInsurancePaidFee:0,
        registeredFee:0,
        totalFee:0,
        otherFee:0
      };
      this.resetForm("form");
      this.drugList=[];
      this.operationList=[];
      this.tagsOptions = [];
    },
    // 取消按钮
    cancel() {
      this.open=false;
    },
    /** 提交按钮 */
    submitForm: function() {
      if(this.tagsOptions.length>0){
        this.form.tags = this.tagsOptions.join(',');
      }else{
        this.form.tags = undefined;
      }
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateTreatRecord(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open=false;
              this.handleQuery();
            });
          } else {
            createTreatRecord(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open=false;
              this.handleQuery();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteTreatRecord(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有购买来源数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportTreatRecord(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
