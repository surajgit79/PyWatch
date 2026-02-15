from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
import os

def generate_monthly_statement(user_data, transactions, card_data, output_path):
    try:
        # Create the PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=0.75*inch
        )
        
        elements = []
        
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1E40AF'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        title = Paragraph("MONTHLY STATEMENT", title_style)
        elements.append(title)
        
        current_date = datetime.now().strftime("%B %Y")
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.grey,
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        date_text = Paragraph(f"Statement Period: {current_date}", date_style)
        elements.append(date_text)
        elements.append(Spacer(1, 0.3*inch))
        
        user_info_data = [
            ['Account Holder:', user_data.get('full_name', 'N/A')],
            ['Email:', user_data.get('email', 'N/A')],
            ['Card:', card_data.get('card_name', 'N/A')],
            ['Statement Date:', datetime.now().strftime("%B %d, %Y")]
        ]
        
        user_info_table = Table(user_info_data, colWidths=[2*inch, 4*inch])
        user_info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(user_info_table)
        elements.append(Spacer(1, 0.3*inch))
        
        opening_balance = card_data.get('opening_balance', 0)
        closing_balance = card_data.get('current_balance', 0)
        credit_limit = card_data.get('credit_limit', 0)
        total_spent = sum([t.get('amount_usd', 0) for t in transactions])
        
        summary_data = [
            ['ACCOUNT SUMMARY', ''],
            ['Opening Balance:', f"${opening_balance:.2f} USD"],
            ['Total Spent:', f"${total_spent:.2f} USD"],
            ['Closing Balance:', f"${closing_balance:.2f} USD"],
            ['Credit Limit:', f"${credit_limit:.2f} USD"],
            ['Available Credit:', f"${credit_limit - closing_balance:.2f} USD"]
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E5E7EB')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1F2937')),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('LINEABOVE', (0, 1), (-1, 1), 1, colors.grey),
            ('LINEBELOW', (0, -1), (-1, -1), 1, colors.grey),
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 0.4*inch))
        
        # Transactions section
        trans_header_style = ParagraphStyle(
            'TransHeader',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1E40AF'),
            spaceAfter=15
        )
        
        trans_header = Paragraph("TRANSACTION DETAILS", trans_header_style)
        elements.append(trans_header)
        
        if transactions:
            trans_table_data = [
                ['Date', 'Merchant', 'Category', 'Amount (USD)', 'Amount (NPR)']
            ]
            
            for t in transactions:
                trans_table_data.append([
                    t.get('transaction_date', 'N/A'),
                    t.get('merchant_name', 'N/A'),
                    t.get('category', 'N/A'),
                    f"${t.get('amount_usd', 0):.2f}",
                    f"NPR{t.get('amount_npr', 0):.2f}"
                ])
            
            trans_table = Table(trans_table_data, colWidths=[1.2*inch, 2*inch, 1.3*inch, 1.2*inch, 1.2*inch])
            trans_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, 0), 12),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')])
            ]))
            
            elements.append(trans_table)
        else:
            no_trans = Paragraph("No transactions for this period.", styles['Normal'])
            elements.append(no_trans)
        
        elements.append(Spacer(1, 0.5*inch))
        
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        
        footer_text = Paragraph(
            f"Generated by PayWatch on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            footer_style
        )
        elements.append(footer_text)
        doc.build(elements)
        return True
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return False