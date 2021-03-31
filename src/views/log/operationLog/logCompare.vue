<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="操作对象" prop="beanName">
       <el-select
         v-model="queryParams.beanName"
         placeholder="关联类名"
         collapse-tags
         size="small"
         style="width: 200px"
       >
         <el-option
           v-for="dict in beanNameOptions"
           :key="dict.id"
           :label="dict.text"
           :value="dict.id"
         />
       </el-select>
      </el-form-item>
      <el-form-item label="主键编号" prop="beanId">
        <el-input
          v-model="beanId"
          size="small"
          style="width: 160px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="loadEditData" v-hasPermi="['dream:query']">搜索</el-button>
        <el-button type="query" icon="el-icon-d-arrow-left" size="mini" @click="handleFetch('EARLY')" v-hasPermi="['log:operationLog:getNearstCompareData']">往前</el-button>
        <el-button type="query" icon="el-icon-d-arrow-right" size="mini" @click="handleFetch('LATER')" v-hasPermi="['log:operationLog:getNearstCompareData']">往后</el-button>
        <el-button type="query" icon="el-icon-s-operation" size="mini" @click="showFlow" v-hasPermi="['log:operationLog:flow']">流水日志</el-button>
      </el-form-item>
    </el-form>

    <!--数据-->
    <div style="padding: 0px 20px 0px 20px;">
      <el-steps>
        <el-step title="数据库最新数据" status="finish" icon="el-icon-edit"></el-step>
        <el-step title="当前操作数据" status="finish" icon="el-icon-upload"></el-step>
        <el-step title="比较数据" status="finish" icon="el-icon-picture"></el-step>
      </el-steps>
    </div>
    <el-row>
      <el-col :span="8" class="card-box">
        <el-card>
          <el-collapse v-model="activeNames">
            <el-collapse-item name="1">
              <template slot="title">
               <i class="header-icon el-icon-info"></i>数据库最新数据
              </template>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box"  align="left">
        <el-card>
          <el-collapse v-model="activeNames">
            <el-collapse-item name="1">
              <template slot="title">
               <i class="header-icon el-icon-info"></i>{{currentInfo.funcName}}
              </template>
              <div class="el-table el-table--enable-row-hover el-table--medium">
                <table cellspacing="0" style="width: 100%;">
                  <tbody>
                    <tr>
                      <td><div class="cell">操作编号</div></td>
                      <td>
                        <div class="cell">
                          <span>{{ currentInfo.id}}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td><div class="cell">操作用户</div></td>
                      <td>
                        <div class="cell">
                          <span>{{ currentInfo.userName+'  (ID:'+currentInfo.userId +')'}}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td><div class="cell">操作时间</div></td>
                      <td>
                        <div class="cell">
                          <span>{{ currentInfo.occurTime}}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td><div class="cell">请求IP</div></td>
                      <td>
                        <div class="cell">
                          <span>{{ currentInfo.ipAddress}}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box" align="left">
        <el-card v-loading="loading">
          <el-collapse v-model="activeNames">
            <el-collapse-item name="1">
              <template slot="title">
               <i class="header-icon el-icon-info"></i>{{compareInfo.funcName}}
              </template>
              <div class="el-table el-table--enable-row-hover el-table--medium">
                <table cellspacing="0" style="width: 100%;">
                  <tbody>
                    <tr>
                      <td><div class="cell">操作编号</div></td>
                      <td>
                        <div class="cell">
                          <span>{{ compareInfo.id}}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td><div class="cell">操作用户</div></td>
                      <td>
                        <div class="cell">
                          <span>{{ compareInfo.userName+'  (ID:'+compareInfo.userId +')'}}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td><div class="cell">操作时间</div></td>
                      <td>
                        <div class="cell">
                          <span>{{ compareInfo.occurTime}}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td><div class="cell">请求IP</div></td>
                      <td>
                        <div class="cell">
                          <span>{{ compareInfo.ipAddress}}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8" class="card-box">
        <el-card>
          <div class="chart-wrapper" align="center" >
            <db-list :jsonData="dbData"/>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box"  align="center">
        <el-card v-loading="cdLoading">
          <div class="chart-wrapper">
            <current-list :jsonData="currentData"/>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box" align="center">
        <el-card v-loading="loading">
          <div class="chart-wrapper">
            <compare-list :jsonData="compareData"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {getCompareData,getEditLogData,getNearstCompareData } from "@/api/log/operationLog";
  import {getDomainClassNamesTree} from "@/api/auth/systemFunction";
  import {copyObject,getQueryObject} from "@/utils/index";
  import {string2Json} from "@/utils/mulanbay";

  import DataList from '../../common/jsonTreeTable'

export default {
  name: "OperationLogLogCompare",
  components: {
    'db-list':DataList,
    'current-list':DataList,
    'compare-list':DataList
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      activeNames: ['0'],
      cdLoading:false,
      loading:false,
      //被操作对象的主键
      beanId:undefined,
      beanNameOptions:[],
      dbData:[],
      currentData:[],
      compareData:[],
      dbInfo:{},
      currentInfo:{},
      compareInfo:{},
      // 查询参数
      queryParams: {
        currentCompareId:undefined,
        compareType:'EARLY'
      }
    };
  },
  created() {
    this.getDomainClassNamesTreeselect();
    let qb = getQueryObject(null);
    if(qb.operationLogId!=null){
      //操作日志页面进来
      this.loadCompareData(qb.operationLogId);
    }else if(qb.beanName!=null){
      //业务页面进来
      this.queryParams.beanName = qb.beanName;
      this.beanId = qb.id;
      this.loadEditData();
    }

  },
  methods: {
    /** 查询管理类名下拉树结构 */
    getDomainClassNamesTreeselect() {
      getDomainClassNamesTree().then(response => {
        this.beanNameOptions = response;
      });
    },
    /** 流水日志 */
    showFlow(){
      //路由定向
      this.$router.push({name:'OperationLogFlow',
      query: {beanName:this.queryParams.beanName,idValue:this.beanId}})
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.loading = true;
      getNearstCompareData(this.queryParams).then(
        response => {
          if(response.compareData==null){
            this.msgError('没有更多数据');
            this.compareData={
              jsonObject:{}
            };
            this.compareInfo='';
          }else{
            this.compareData={
              jsonObject:string2Json(response.compareData.paras)
            };
            this.compareInfo=this.genOperInfo(response.compareData);
            //设置当前比较值
            this.queryParams.currentCompareId = response.compareData.id;
          }
          this.loading = false;
        }
      );

    },
    /** 往前/往后按钮操作 */
    handleFetch(compareType){
      this.queryParams.compareType= compareType;
      this.handleQuery();
    },
    /** 操作日志页面进入:初始化获取数据 */
    loadCompareData(operationLogId) {
      let para ={
        id:operationLogId
      };
      getCompareData(para).then(
        response => {
          this.dbData={
            jsonObject:response.latestData
          };
          this.currentData={
            jsonObject:string2Json(response.currentData.paras)
          };
          this.compareData={
            jsonObject:response.compareData
          };
          //获取BeanName，无论从操作日志进来还是各业务模块进来，最终还是转换为业务类的Bean
          this.queryParams.beanName = response.currentData.systemFunction.beanName;
          this.beanId = response.currentData.idValue;
          //设置初始比较值
          this.queryParams.currentCompareId = response.currentData.id;
          this.currentInfo=this.genOperInfo(response.currentData);
          this.compareInfo=this.genOperInfo(response.compareData);
        }
      );
    },
    /** 业务页面进入:初始化获取数据 */
    loadEditData(operationLogId) {
      let para ={
        id:this.beanId,
        beanName:this.queryParams.beanName,
        compareType:this.queryParams.compareType
      };
      this.cdLoading = true;
      getEditLogData(para).then(
        response => {
          this.dbData={
            jsonObject:response.latestData
          };
          if(response.currentData!=null){
            this.currentData={
              jsonObject:string2Json(response.currentData.paras)
            };
            //设置初始比较值
            this.queryParams.currentCompareId = response.currentData.id;
          }else{
            this.currentData={
              jsonObject:{}
            };
          }
          this.compareData={
            jsonObject:response.compareData
          };
          this.currentInfo=this.genOperInfo(response.currentData);
          this.compareInfo=this.genOperInfo(response.compareData);
          this.cdLoading = false;
        }
      );
    },
    //操作描述
    genOperInfo(log){
      if(log==null){
        return {};
      }else{
        const info={
          id:log.id,
          userId:log.userId,
          userName:log.userName,
          funcName:log.systemFunction.name,
          occurTime:log.occurEndTime,
          ipAddress:log.ipAddress
        }
        return info;
      }
    }
  }
};
</script>
