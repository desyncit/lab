{{/*
Expand the name of the chart.
*/}}
{{- define "rook-ceph-obc-plugin.name" -}}
{{- default (default .Chart.Name .Release.Name) .Values.plugin.name | trunc 63 | trimSuffix "-" }}
{{- end }}


{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "rook-ceph-obc-plugin.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "rook-ceph-obc-plugin.labels" -}}
helm.sh/chart: {{ include "rook-ceph-obc-plugin.chart" . }}
{{ include "rook-ceph-obc-plugin.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "rook-ceph-obc-plugin.selectorLabels" -}}
app: {{ include "rook-ceph-obc-plugin.name" . }}
app.kubernetes.io/name: {{ include "rook-ceph-obc-plugin.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: {{ include "rook-ceph-obc-plugin.name" . }}
{{- end }}

{{/*
Create the name secret containing the certificate
*/}}
{{- define "rook-ceph-obc-plugin.certificateSecret" -}}
{{ default (printf "%s-cert" (include "rook-ceph-obc-plugin.name" .)) .Values.plugin.certificateSecretName }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "rook-ceph-obc-plugin.serviceAccountName" -}}
{{- if .Values.plugin.serviceAccount.create }}
{{- default (include "rook-ceph-obc-plugin.name" .) .Values.plugin.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the patcher
*/}}
{{- define "rook-ceph-obc-plugin.patcherName" -}}
{{- printf "%s-patcher" (include "rook-ceph-obc-plugin.name" .) }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "rook-ceph-obc-plugin.patcherServiceAccountName" -}}
{{- if .Values.plugin.patcherServiceAccount.create }}
{{- default (printf "%s-patcher" (include "rook-ceph-obc-plugin.name" .)) .Values.plugin.patcherServiceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.patcherServiceAccount.name }}
{{- end }}
{{- end }}