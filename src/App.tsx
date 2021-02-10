import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup"

import './App.css';

interface DosingParameters {
  ld: number;
  md_min: number;
  md_max: number;
  md_freq: number;
}

const schema = yup.object().shape({
  age: yup.number().positive().integer().required(),
  weight: yup.number().positive().required(),
  creatinine: yup.number().positive().required()
})

function App() {
  const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) })
  const [result, setResult] = useState<DosingParameters>();
  const onSubmit = (data: Record<string, any>) => {
    let { age, weight: wt, creatinine: cr, sex } = data;
    setResult(vancDose(age, wt, cr, sex));
  }

  return (
    <div className="App">
      <div className="container">
        <div className="form-container" style={{borderBottom: `${result ? '1px solid grey' : ''}`}}>
          <h2 style={{marginTop: 0}}>Vancomycin dose calculator (StV compliant)</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-row">
              <label htmlFor="age">Patient's age (years): </label>
              <input type="number" name="age" id="age" ref={register}/>
            </div>
            <div className="input-row">
              <label htmlFor="weight">Patient's weight (kg): </label>
              <input type="text" name="weight" id="weight" ref={register}/>
            </div>
            <div className="input-row">
              <label htmlFor="creatinine">Patient's last creatinine (umol/L): </label>
              <input type="text" name="creatinine" id="creatinine" ref={register}/>
            </div>
            <div className="input-row">
              <label htmlFor="sex">Patient's sex: </label>
              <select name="sex" id="sex" ref={register}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <input type="submit" value="Calculate dose"/>
          </form>
        </div>
        <div className={`result-container ${result ? "filled" : ""}`}>
          {result ? (
            <>
              <p>Doses rounded to nearest 250mg.</p>
              <p><strong>Loading dose:</strong> {result.ld} mg (administer over {adminNote(result.ld)} minutes)</p>
              <p><strong>Maintenance dose</strong>: {result.md_min === result.md_max ? (
                <>
                  {result.md_max} mg
                </>
              ) : (
                <>
                  {result.md_min}-{result.md_max} mg
                </>
              )} q{result.md_freq}h (administer over {adminNote(result.md_max)} minutes)</p>
              <p>For other details please RTFM.</p>
            </>
          ) : ""}
        </div>
      </div>
    </div>
  );
}

function vancDose(age: number, wt: number, cr: number, sex: "male" | "female") {
  const crcl = (140 - age) * wt / (0.815*cr) * ((sex === "female") ? 0.85 : 1)
  let ld, md_min, md_max, md_freq;
  if (crcl > 60) {
    md_min = 15*wt;
    md_max = 20*wt;
    md_freq = 12;
  } else if (crcl >= 40 && crcl <= 60) {
    md_min = md_max = 15*wt;
    md_freq = 12;
  } else if (crcl >= 20 && crcl < 40) {
    md_min = md_max = 15*wt;
    md_freq = 24;
  } else {
    md_min = md_max = 15*wt;
    md_freq = 48;
  }

  if (crcl >= 20) {
    ld = 25*wt;
  } else {
    ld = 15*wt;
  }

  return {
    ld: Math.round(ld / 250) * 250,
    md_min: Math.round(md_min / 250) * 250,
    md_max: Math.round(md_max/250) * 250,
    md_freq
  }
}

function adminNote(dose: number): number {
  let at10 = dose/10;
  return Math.max(60, 120, at10)
}

export default App;
