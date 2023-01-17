import { notify } from "../../components/error";
import type { IRow, IFieldMeta } from "../../interfaces";


export const PredictAlgorithms = [
    { key: 'decisionTree', text: '决策树（Decision Tree）' },
    { key: 'randomForest', text: '随机森林（Random Forest）' },
    { key: 'gradientBoosting', text: '梯度增强（Gradient Boosting）' },
    { key: 'adaBoost', text: '自适应增强（AdaBoost）' },
] as const;

export type PredictAlgorithm = typeof PredictAlgorithms[number]['key'];

export enum TrainTestSplitFlag {
    none = -1,
    train = 0,
    test = 1,
}

export enum PredictResultFlag {
    wrong = 0,
    right = 1,
}

export interface IPredictProps {
    dataSource: IRow[];
    fields: IFieldMeta[];
    model: {
        algorithm: PredictAlgorithm;
        features: string[];
        targets: string[];
    };
    /** same length to dataSource */
    trainTestSplitIndices: TrainTestSplitFlag[];
    mode: 'classification' | 'regression';
}

export type PredictResultItem = {
    /** index from the dataSource */
    0: number;
    /** is result right */
    1: PredictResultFlag;
} & [number, PredictResultFlag];

export interface IPredictResult {
    accuracy: number;
    result: PredictResultItem[];
}

const PREDICT_API_KEY = 'prediction_service';
function getPredictAPIPath (path = "/api/train_test") {
    const baseURL = new URL(window.location.href);
    const serviceURL = new URL(baseURL.searchParams.get(PREDICT_API_KEY) || localStorage.getItem(PREDICT_API_KEY) || "http://127.0.0.1:5533/api/train_test");
    serviceURL.pathname = path;
    return serviceURL.toString();
}

export const execPredict = async (props: IPredictProps): Promise<IPredictResult | null> => {
    try {
        // console.log(props.trainTestSplitIndices.map(flag => ({
        //     [-1]: 'x',
        //     0: 'T',
        //     1: '_',
        // }[flag])).join(''), props.trainTestSplitIndices.length)
        const res = await fetch(getPredictAPIPath(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(props),
        });
        const result = await res.json();
        if (result.success) {
            return result.data as IPredictResult;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        notify({
            title: 'Predict Service Failed',
            type: 'error',
            content: `${error}`,
        });
        return null;
    }
};
